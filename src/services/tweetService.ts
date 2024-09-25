import { getNextTweet } from "../database/dbFunctions";
import { userClient } from "./twitterClient";

export async function sendTweet(): Promise<void> {
  if (!userClient) {
    console.error("User client not initialized. Please authenticate first.");
    return;
  }

  const tweetContent = await getNextTweet();
  if (tweetContent) {
    try {
      console.log(`Attempting to send tweet: ${tweetContent}`);
      await userClient.v2.tweet(tweetContent);
      console.log(`Tweet sent: ${tweetContent}`);
    } catch (error) {
      console.error("Error sending tweet:", error);
    }
  } else {
    console.log("No more tweets to send.");
  }
}
