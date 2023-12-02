import OpenAi from 'openai';
import { TwitterApi } from 'twitter-api-v2';
import { prompts } from './prompts';

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

async function generateTweet(): Promise<string | null> {
  const completion = await openaiClient.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Only reply with the raw text of the tweet.',
      },
      { role: 'user', content: prompts[Math.round(Math.random() * prompts.length - 1)] },
    ],
    model: 'gpt-3.5-turbo-1106',
    response_format: { type: 'json_object' },
  });
  return completion.choices[0].message.content;
}

async function postTweet(tweet: string) {
  const res = await twitterClient.v2.tweet(tweet);
  if (res.errors) {
    console.log(res.errors);
    return false;
  }
  return true;
}

export async function tweetViaAi() {
  const tweet = await generateTweet();
  if (tweet) {
    const wasTweetSucceful = await postTweet(tweet);
    if (wasTweetSucceful) {
      console.log('Tweeted successfully');
    } else {
      throw new Error('Tweet failed');
    }
  }
}
