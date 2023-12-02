import { tweetViaAi } from "./tweet-service";

export async function scheduleHandler() {
	await tweetViaAi();
}