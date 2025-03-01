import { OpenGradientClient } from './client';
import { 
  InferenceMode, 
  ModelInput, 
  InferenceResult, 
  TextGenerationOutput,
  LLM 
} from './types';

export * from './types';
export * from './client';
export * from './llm';
export * from './alphasense';

let _client: OpenGradientClient | null = null;

export function init(
  privateKey: string,
  rpcUrl?: string,
  contractAddress?: string
): OpenGradientClient {
  _client = new OpenGradientClient(privateKey, rpcUrl, contractAddress);
  return _client;
}

export function infer(
  modelCid: string,
  inferenceMode: InferenceMode,
  modelInput: ModelInput,
  maxRetries?: number
): Promise<InferenceResult> {
  if (!_client) {
    throw new Error('OpenGradient client not initialized. Call init() first.');
  }
  return _client.infer(modelCid, inferenceMode, modelInput, maxRetries);
}

// Add other convenience functions
export function llmChat(
  modelCid: LLM,
  messages: Array<Record<string, any>>,
  maxTokens?: number,
  temperature?: number
): Promise<TextGenerationOutput> {
  if (!_client) {
    throw new Error('OpenGradient client not initialized. Call init() first.');
  }
  return _client.llmChat(modelCid, messages, undefined, maxTokens, undefined, temperature);
}

// Export other convenience functions that wrap client methods 