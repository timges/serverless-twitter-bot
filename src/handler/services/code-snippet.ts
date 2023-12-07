import axios from 'axios';
import { generateCompletion } from './open-ai';

/**
 * Generates a code snippet to support a given tweet.
 *
 * This function uses the OpenAI API to generate a code snippet based on the content of the tweet.
 * If the generated code snippet is 'undefined' or null, the function returns undefined.
 * Otherwise, it sends a POST request to 'https://sourcecodeshots.com/api/image' to generate an image of the code snippet.
 * The language of the code snippet is determined by matching the first line of the code snippet against a regular expression.
 *
 * @param {string} tweet - The tweet that the code snippet should support.
 * @returns {Promise<string | undefined>} A promise that resolves to the data of the generated image, or undefined if no code snippet was generated.
 */
export async function generateCodeSnippet(tweet: string): Promise<string | undefined> {
  const completion = await generateCompletion(
    [
      {
        role: 'system',
        content: 'Reply with a code snippet only or "undefined" if no code snippet is needed.',
      },
      {
        role: 'user',
        content: `Generate a code snippet to support this tweet: ${tweet}. Reply with the raw text. If it doesn't need a code snippet, reply with "undefined".`,
      },
    ],
    'gpt-4-1106-preview',
    300
  );
  const codeSnippet = completion.choices[0].message.content;
  console.log(!!codeSnippet);
  const parsedSnippet = codeSnippet.match(
    /^```(js|javascript|css|typescript|ts|java|jsx|tsx|bash|sh|zsh|svelte|json|yaml|yml)\n([\s\S]*?)```$/
  );
  if (!parsedSnippet?.[1] || !parsedSnippet?.[2]) {
    console.log(!!codeSnippet);
    return undefined;
  }
  const response = await axios.post(
    'https://sourcecodeshots.com/api/image',
    {
      code: parsedSnippet[2],
      settings: {
        language: parsedSnippet[1],
        theme: 'dark-plus',
      },
    },
    { responseType: 'arraybuffer' }
  );
  return response.data;
}
