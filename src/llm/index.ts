import { OpenGradientClient } from '../client';
import { LLM, LlmInferenceMode } from '../types';

export interface LangchainMessage {
  role: string;
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
}

export class OpenGradientChatModel {
  private client: OpenGradientClient;
  private modelCid: LLM;
  private maxTokens: number;

  constructor(privateKey: string, modelCid: LLM, maxTokens: number = 300) {
    this.client = new OpenGradientClient(privateKey);
    this.modelCid = modelCid;
    this.maxTokens = maxTokens;
  }

  async invoke(messages: LangchainMessage[]): Promise<LangchainMessage> {
    const response = await this.client.llmChat(
      this.modelCid,
      messages,
      LlmInferenceMode.VANILLA,
      this.maxTokens
    );

    if (!response.chatOutput) {
      throw new Error('No chat output received');
    }

    return {
      role: response.chatOutput.role,
      content: response.chatOutput.content,
      toolCalls: response.chatOutput.tool_calls
    };
  }
}

export function langchainAdapter(
  privateKey: string,
  modelCid: LLM,
  maxTokens: number = 300
): OpenGradientChatModel {
  return new OpenGradientChatModel(privateKey, modelCid, maxTokens);
} 