import "server-only";

import { ChatOpenAI } from "@langchain/openai";

import { AI_GATEWAY_BASE_URL, CHAT_MODEL } from "@/lib/ai/constants";
import { getGatewayApiKey } from "@/lib/ai/gateway";

export function getChatModel(): ChatOpenAI {
  return new ChatOpenAI({
    apiKey: getGatewayApiKey(),
    model: CHAT_MODEL,
    temperature: 0,
    configuration: {
      baseURL: AI_GATEWAY_BASE_URL,
    },
  });
}
