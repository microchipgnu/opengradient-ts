import { ethers } from 'ethers';
import { 
  InferenceMode, 
  LlmInferenceMode,
  ModelInput,
  ModelOutput,
  InferenceResult,
  TextGenerationOutput,
  LLM,
  HistoricalInputQuery,
  SchedulerParams
} from './types';
import { 
  INFERENCE_ABI, 
  PRICE_HISTORY_INFERENCE_ABI, 
  WORKFLOW_SCHEDULER_ABI,
  WORKFLOW_SCHEDULER_ADDRESS 
} from './constants';

export class OpenGradientClient {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Signer;
  private inferenceContract: ethers.Contract;

  constructor(
    privateKey: string,
    rpcUrl: string = 'http://18.188.176.119:8545',
    contractAddress: string = '0x8383C9bD7462F12Eb996DD02F78234C0421A6FaE'
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.inferenceContract = new ethers.Contract(
      contractAddress,
      INFERENCE_ABI,
      this.signer
    );
  }

  async infer(
    modelCid: string,
    inferenceMode: InferenceMode,
    modelInput: ModelInput,
    maxRetries?: number
  ): Promise<InferenceResult> {
    const tx = await this.inferenceContract.run(
      modelCid,
      inferenceMode,
      modelInput
    );
    const receipt = await tx.wait();
    // Parse events and return result
    return {
      transactionHash: receipt.transactionHash,
      modelOutput: this.parseModelOutput(receipt)
    };
  }

  async llmChat(
    modelCid: LLM,
    messages: Array<Record<string, any>>,
    inferenceMode: LlmInferenceMode = LlmInferenceMode.VANILLA,
    maxTokens: number = 100,
    stopSequence?: string[],
    temperature: number = 0.0,
    tools?: Array<Record<string, any>>,
    toolChoice?: string,
    maxRetries?: number
  ): Promise<TextGenerationOutput> {
    const tx = await this.inferenceContract.runLLMChat({
      mode: inferenceMode,
      modelCid,
      messages,
      tools: tools || [],
      toolChoice: toolChoice || '',
      maxTokens,
      stopSequence: stopSequence || [],
      temperature
    });
    const receipt = await tx.wait();
    return this.parseLLMChatOutput(receipt);
  }

  async newWorkflow(
    modelCid: string,
    inputQuery: HistoricalInputQuery,
    inputTensorName: string,
    schedulerParams?: SchedulerParams
  ): Promise<string> {
    // Deploy workflow contract
    const factory = new ethers.ContractFactory(
      PRICE_HISTORY_INFERENCE_ABI,
      '0x...', // TODO: Add bytecode from original Python SDK
      this.signer
    );

    const contract = await factory.deploy(
      modelCid,
      inputTensorName,
      inputQuery.toAbiFormat()
    );

    await contract.deployed();

    // Register with scheduler if params provided
    if (schedulerParams) {
      const scheduler = new ethers.Contract(
        WORKFLOW_SCHEDULER_ADDRESS,
        WORKFLOW_SCHEDULER_ABI,
        this.signer
      );

      await scheduler.registerTask(
        contract.address,
        schedulerParams.endTime,
        schedulerParams.frequency
      );
    }

    return contract.address;
  }

  async readWorkflowResult(contractAddress: string): Promise<ModelOutput> {
    const workflowContract = new ethers.Contract(
      contractAddress,
      PRICE_HISTORY_INFERENCE_ABI,
      this.signer
    );
    
    const result = await workflowContract.getInferenceResult();
    return this.parseWorkflowOutput(result);
  }

  private parseModelOutput(receipt: ethers.ContractReceipt): Record<string, number[]> {
    const event = receipt.events?.find((e) => e.event === 'InferenceResult');
    if (!event || !event.args) {
      throw new Error('No InferenceResult event found');
    }
    
    const output = event.args.output;
    return this.parseNumberTensors(output.numbers);
  }

  private parseLLMChatOutput(receipt: ethers.ContractReceipt): TextGenerationOutput {
    const event = receipt.events?.find((e) => e.event === 'LLMChatResult');
    if (!event || !event.args) {
      throw new Error('No LLMChatResult event found');
    }

    return {
      transactionHash: receipt.transactionHash,
      finishReason: event.args.response.finish_reason,
      chatOutput: event.args.response.message
    };
  }

  private parseWorkflowOutput(result: any): ModelOutput {
    return {
      numbers: this.parseNumberTensors(result.numbers),
      strings: this.parseStringTensors(result.strings),
      jsons: this.parseJsonTensors(result.jsons),
      isSimulationResult: result.isSimulationResult
    };
  }

  private parseNumberTensors(tensors: any[]): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    for (const tensor of tensors) {
      result[tensor.name] = tensor.values.map(
        (v: [ethers.BigNumber, number]) => Number(v[0]) / Math.pow(10, v[1])
      );
    }
    return result;
  }

  private parseStringTensors(tensors: any[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const tensor of tensors) {
      result[tensor.name] = tensor.values;
    }
    return result;
  }

  private parseJsonTensors(tensors: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const tensor of tensors) {
      result[tensor.name] = JSON.parse(tensor.value);
    }
    return result;
  }
} 