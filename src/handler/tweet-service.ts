import OpenAi from 'openai';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import { prompts } from './prompts';
import axios from 'axios';

const twitterClient = new TwitterApi({
  appKey: process.env.CONSUMER_KEY as string,
  appSecret: process.env.CONSUMER_KEY_SECRET as string,
  accessToken: process.env.ACCESS_KEY as string,
  accessSecret: process.env.ACCESS_KEY_SECRET as string,
});

const openaiClient = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY as string,
  timeout: 10000,
});

async function generateCompletion(
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

async function uploadMedia(codeSnippet: string): Promise<string | undefined> {
  if (!codeSnippet) {
    return;
  }
  return await twitterClient.v1.uploadMedia(codeSnippet, {
    mimeType: EUploadMimeType.Png,
  });
}

async function postTweet(tweet: string, mediaId?: string): Promise<boolean> {
  const res = await twitterClient.v2.tweet({
    text: tweet,
    media: mediaId
      ? {
          media_ids: [mediaId],
        }
      : undefined,
  });
  if (res.errors) {
    console.log(res.errors);
    return false;
  }
  return true;
}

async function generateTweet(): Promise<string | undefined> {
  const completion = await generateCompletion(
    [
      {
        role: 'system',
        content: 'Only reply with the raw text of the tweet.',
      },
      { role: 'user', content: prompts[Math.round(Math.random() * prompts.length - 1)] },
    ],
    'gpt-4-1106-preview',
    240
  );
  const tweet = completion.choices[0].message.content;
  console.log(tweet?.length);
  return tweet?.startsWith('"') ? tweet.substring(1, tweet.length - 1) : tweet || undefined;
}

async function generateCodeSnippet(tweet: string): Promise<string | undefined> {
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
  if (codeSnippet === 'undefined' || codeSnippet === null) {
    return;
  }
  const language = codeSnippet.match(/^```(js|javascript|css|typescript|ts|java)\n([\s\S]*?)```$/);
  const response = await axios.post(
    'https://sourcecodeshots.com/api/image',
    {
      code: language?.[2],
      settings: {
        language: language?.[1],
        theme: 'dark-plus',
      },
    },
    { responseType: 'arraybuffer' }
  );
  return response.data;
}

export async function tweetViaAi() {
  const tweet = await generateTweet();
  const codeSnippet = await generateCodeSnippet(tweet as string);
  if (tweet && codeSnippet) {
    const mediaId = await uploadMedia(codeSnippet);
    const wasTweetSuccessful = await postTweet(tweet, mediaId);
    if (wasTweetSuccessful) {
      console.log('Tweeted successfully');
    } else {
      throw new Error('Tweet failed');
    }
  }
}
