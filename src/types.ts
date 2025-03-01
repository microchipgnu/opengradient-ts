import { BigNumber } from 'ethers';

export enum CandleOrder {
  ASCENDING = 0,
  DESCENDING = 1
}

export enum CandleType {
  HIGH = 0,
  LOW = 1,
  OPEN = 2,
  CLOSE = 3,
  VOLUME = 4
}

export interface HistoricalInputQuery {
  base: string;
  quote: string;
  totalCandles: number;
  candleDurationInMins: number;
  order: CandleOrder;
  candleTypes: CandleType[];

  toAbiFormat(): [string, string, number, number, number, number[]];
}

export interface Number {
  value: BigNumber;
  decimals: number;
}

export interface NumberTensor {
  name: string;
  values: [BigNumber, number][];
}

export interface StringTensor {
  name: string;
  values: string[];
}

export interface ModelInput {
  numbers: NumberTensor[];
  strings: StringTensor[];
}

export enum InferenceMode {
  VANILLA = 0,
  ZKML = 1,
  TEE = 2
}

export enum LlmInferenceMode {
  VANILLA = 0,
  TEE = 1
}

export interface ModelOutput {
  numbers: Record<string, number[]>;
  strings: Record<string, string[]>;
  jsons: Record<string, any>;
  isSimulationResult: boolean;
}

export interface InferenceResult {
  transactionHash: string;
  modelOutput: Record<string, number[]>;
}

export interface TextGenerationOutput {
  transactionHash: string;
  finishReason?: string;
  chatOutput?: Record<string, any>;
  completionOutput?: string;
}

export enum LLM {
  META_LLAMA_3_8B_INSTRUCT = "meta-llama/Meta-Llama-3-8B-Instruct",
  LLAMA_3_2_3B_INSTRUCT = "meta-llama/Llama-3.2-3B-Instruct", 
  QWEN_2_5_72B_INSTRUCT = "Qwen/Qwen2.5-72B-Instruct",
  META_LLAMA_3_1_70B_INSTRUCT = "meta-llama/Llama-3.1-70B-Instruct",
  DOBBY_UNHINGED_3_1_8B = "SentientAGI/Dobby-Mini-Unhinged-Llama-3.1-8B",
  DOBBY_LEASHED_3_1_8B = "SentientAGI/Dobby-Mini-Leashed-Llama-3.1-8B"
}

export enum TEE_LLM {
  META_LLAMA_3_1_70B_INSTRUCT = "meta-llama/Llama-3.1-70B-Instruct"
}

export interface SchedulerParams {
  frequency: number;
  durationHours: number;
  endTime: number;
} 