import { OAuthDataModel, TrackedAccountModel, TweetModel } from "./schema";
import { connectToDatabase, closeDatabaseConnection } from "./dbConnect";
import { OAuthData, TrackedAccount, Tweet } from "../types";

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

export async function fetchAndStoreEFPData(
  ensNamesOrAddresses: string[]
): Promise<void> {
  for (const ensName of ensNamesOrAddresses) {
    try {
      // Fetch details
      const detailsResponse = await fetch(
        `https://api.ethfollow.xyz/api/v1/users/${ensName}/details`
      );
      if (!detailsResponse.ok) {
        throw new Error(`HTTP error! status: ${detailsResponse.status}`);
      }
      const details = await detailsResponse.json();

      // Fetch following
      const followingResponse = await fetch(
        `https://api.ethfollow.xyz/api/v1/users/${ensName}/following?limit=3000`
      );
      if (!followingResponse.ok) {
        throw new Error(`HTTP error! status: ${followingResponse.status}`);
      }
      const following = await followingResponse.json();

      // Prepare data for TrackedAccount
      const trackedAccountData: Partial<TrackedAccount> = {
        address: details.address,
        ensName: details.ens.name,
        listTokenId: details.primary_list,
        followedAccounts: following.following.map((f: any) => f.data),
        lastChecked: new Date(),
      };

      // Update or create TrackedAccount document
      await TrackedAccountModel.findOneAndUpdate(
        { ensName: ensName },
        trackedAccountData,
        { upsert: true, new: true }
      );

      console.log(`Data for ${ensName} fetched and stored successfully.`);
    } catch (error) {
      console.error(`Error processing ${ensName}:`, error);
    }
  }
}

export async function batchFetchAndStoreEFPData(
  ensNamesOrAddresses: string[],
  batchSize: number = 10
): Promise<void> {
  // Function to process a single ENS name
  async function processENSOrAddress(ensName: string): Promise<void> {
    try {
      const [detailsResponse, followingResponse] = await Promise.all([
        fetch(`https://api.ethfollow.xyz/api/v1/users/${ensName}/details`),
        fetch(
          `https://api.ethfollow.xyz/api/v1/users/${ensName}/following?limit=3000`
        ),
      ]);

      if (!detailsResponse.ok || !followingResponse.ok) {
        throw new Error(
          `HTTP error! Details status: ${detailsResponse.status}, Following status: ${followingResponse.status}`
        );
      }

      const [details, following] = await Promise.all([
        detailsResponse.json(),
        followingResponse.json(),
      ]);

      const trackedAccountData: Partial<TrackedAccount> = {
        address: details.address,
        ensName: details.ens.name,
        listTokenId: details.primary_list,
        followedAccounts: following.following.map((f: any) => f.data),
        lastChecked: new Date(),
      };

      await TrackedAccountModel.findOneAndUpdate(
        { ensName: ensName },
        trackedAccountData,
        { upsert: true, new: true }
      );

      console.log(`Data for ${ensName} fetched and stored successfully.`);
    } catch (error) {
      console.error(`Error processing ${ensName}:`, error);
    }
  }

  // Process ENS names in batches
  for (let i = 0; i < ensNamesOrAddresses.length; i += batchSize) {
    const ensorAddressBatch = ensNamesOrAddresses.slice(i, i + batchSize);
    await Promise.all(ensorAddressBatch.map(processENSOrAddress));
    console.log(`Processed batch ${i / batchSize + 1}`);
  }
}
