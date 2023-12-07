import { generateCodeSnippet } from './services/code-snippet';
import { generateTweet, postTweet, uploadMedia } from './services/twitter';

export async function scheduleHandler() {
  const tweet = await generateTweet();
  if (!tweet) {
    throw new Error('Tweet generation failed');
  }
  if (tweet.length > 280) {
    throw new Error('Tweet is too long');
  }
  const codeSnippet = await generateCodeSnippet(tweet);
  const mediaId = codeSnippet ? await uploadMedia(codeSnippet) : undefined;
  const wasTweetSuccessful = await postTweet(tweet, mediaId);
  if (wasTweetSuccessful) {
    console.log('Tweeted successfully');
  } else {
    throw new Error('Tweet failed');
  }
}
