import "server-only";

export function getGatewayApiKey(): string {
  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    throw new Error("AI_GATEWAY_API_KEY is not set");
  }

  return apiKey;
}
