import OpenAi from 'openai';

const openaiClient = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY as string,
  timeout: 10000,
});

export async function generateCompletion(
  messages: any[],
  model: string,
  max_tokens: number
): Promise<any> {
  return await openaiClient.chat.completions.create({
    messages,
    model,
    max_tokens,
  });
}
