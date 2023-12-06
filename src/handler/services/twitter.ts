import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import { prompts } from '../util/prompts';
import { generateCompletion } from './open-ai';

const twitterClient = new TwitterApi({
  appKey: process.env.CONSUMER_KEY as string,
  appSecret: process.env.CONSUMER_KEY_SECRET as string,
  accessToken: process.env.ACCESS_KEY as string,
  accessSecret: process.env.ACCESS_KEY_SECRET as string,
});

export async function uploadMedia(codeSnippet: string): Promise<string | undefined> {
  if (!codeSnippet) {
    return;
  }
  return await twitterClient.v1.uploadMedia(codeSnippet, {
    mimeType: EUploadMimeType.Png,
  });
}

export async function postTweet(tweet: string, mediaId?: string): Promise<boolean> {
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

export async function generateTweet(): Promise<string | undefined> {
  const completion = await generateCompletion(
    [
      {
        role: 'system',
        content:
          'Only reply with the raw text of the tweet. Make sure that the completion is LESS than 280 characters.',
      },
      {
        role: 'user',
        content: `${
          prompts[Math.round(Math.random() * prompts.length - 1)]
        }. Try to engage the community, if it makes sense to do so.`,
      },
    ],
    'gpt-4-1106-preview',
    240
  );
  const tweet = completion.choices[0].message.content;
  console.log(tweet?.length);
  return tweet?.startsWith('"') ? tweet.substring(1, tweet.length - 1) : tweet || undefined;
}
