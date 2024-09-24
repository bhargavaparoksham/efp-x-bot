import { OAuthDataModel, TweetModel } from "./schema";
import { connectToDatabase, closeDatabaseConnection } from "./dbConnect";
import { OAuthData, Tweet } from "../types";

// Database operations
export async function storeOAuthData(data: OAuthData): Promise<void> {
  await OAuthDataModel.findOneAndUpdate({ userId: data.userId }, data, {
    upsert: true,
  });
}

export async function getOAuthData(userId: string): Promise<OAuthData | null> {
  return await OAuthDataModel.findOne({ userId });
}

export async function storeTweets(tweets: string[]): Promise<void> {
  const tweetDocs = tweets.map((tweet) => ({ content: tweet }));
  await TweetModel.insertMany(tweetDocs);
}

export async function getNextTweet(): Promise<string | null> {
  const tweet = await TweetModel.findOneAndUpdate(
    { sent: false },
    { sent: true }
  );
  return tweet ? tweet.content : null;
}

export { connectToDatabase, closeDatabaseConnection };
