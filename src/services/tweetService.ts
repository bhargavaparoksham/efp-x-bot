import { getNextTweet } from "../database/dbFunctions";
import { TweetQueueModel } from "../database/schema";
import { TweetQueue } from "../types";
import { userClient } from "./twitterClient";

export async function sendTweet(tweetData: TweetQueue): Promise<void> {
  if (!userClient) {
    console.error("User client not initialized. Please authenticate first.");
    return;
  }

  const tweetContent = `${tweetData.ensName1} has ${tweetData.action}ed ${tweetData.ensName2}`;
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

export async function sendTweets(): Promise<void> {
  const tweetQueueData = await TweetQueueModel.find({});

  // loop through tweetQueueData and send tweet & if tweet is sent, remove it from db
  tweetQueueData.forEach(async (tweet) => {
    try {
      setTimeout(async () => {
        await sendTweet(tweet);
      }, 2000);
      await TweetQueueModel.deleteOne({ _id: tweet._id });
    } catch (error) {
      console.error("Error sending tweet:", error, tweet._id);
    }
  });
}
