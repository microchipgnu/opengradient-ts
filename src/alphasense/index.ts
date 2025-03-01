import { OpenGradientClient } from '../client';
import { ModelOutput, ModelInput, InferenceMode } from '../types';
import dotenv from 'dotenv';

dotenv.config();

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

export enum ToolType {
  LANGCHAIN = 'langchain',
  SWARM = 'swarm'
}

export interface Tool {
  name: string;
  description: string;
  invoke: (args: any) => Promise<any>;
}

export function createReadWorkflowTool(
  toolType: ToolType,
  workflowContractAddress: string,
  toolName: string,
  toolDescription: string,
  outputFormatter: (output: ModelOutput) => string = (x) => JSON.stringify(x)
): Tool {
  const tool: Tool = {
    name: toolName,
    description: toolDescription,
    invoke: async () => {
      const privateKey = getRequiredEnvVar('OG_PRIVATE_KEY');
      const client = new OpenGradientClient(privateKey);
      const result = await client.readWorkflowResult(workflowContractAddress);
      return outputFormatter(result);
    }
  };

  return tool;
}

export function createRunModelTool(
  toolType: ToolType,
  modelCid: string,
  toolName: string,
  inputGetter: () => ModelInput,
  outputFormatter: (output: ModelOutput) => string = (x) => JSON.stringify(x),
  toolDescription: string = 'Executes the given ML model'
): Tool {
  const tool: Tool = {
    name: toolName,
    description: toolDescription,
    invoke: async (args: any) => {
      const privateKey = getRequiredEnvVar('OG_PRIVATE_KEY');
      const client = new OpenGradientClient(privateKey);
      const modelInput = inputGetter();
      const result = await client.infer(modelCid, InferenceMode.VANILLA, modelInput);
      
      const output: ModelOutput = {
        numbers: result.modelOutput,
        strings: {},
        jsons: {},
        isSimulationResult: false
      };
      
      return outputFormatter(output);
    }
  };

  return tool;
} 