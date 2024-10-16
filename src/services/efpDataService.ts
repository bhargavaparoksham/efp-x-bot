import { TrackedAccountModel, TweetQueueModel } from "../database/schema";
import { TrackedAccount, TweetQueue } from "../types";

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
          `https://api.ethfollow.xyz/api/v1/users/${ensName}/following?limit=500`
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

      const newTrackedAccountData: Partial<TrackedAccount> = {
        address: details.address,
        ensName: details.ens.name,
        listTokenId: details.primary_list,
        followedAccounts: following.following.map((f: any) => f.data),
        lastChecked: new Date(),
      };

      let tweetQueueData: TweetQueue[] = [];

      const currentTrackedAccountData = await TrackedAccountModel.findOne({
        ensName: ensName,
      });

      if (currentTrackedAccountData) {
        if (newTrackedAccountData.followedAccounts) {
          const {
            itemsInBNotInA: followedAccounts,
            itemsInANotInB: unfollowedAccounts,
          } = findDifferences(
            currentTrackedAccountData.followedAccounts,
            newTrackedAccountData.followedAccounts
          );

          followedAccounts.forEach((followedAccount) => {
            tweetQueueData.push({
              address1: currentTrackedAccountData.address,
              ensName1: currentTrackedAccountData.ensName,
              address2: followedAccount,
              ensName2: "",
              action: "follow",
            });
          });

          unfollowedAccounts.forEach((unfollowedAccount) => {
            tweetQueueData.push({
              address1: currentTrackedAccountData.address,
              ensName1: currentTrackedAccountData.ensName,
              address2: unfollowedAccount,
              ensName2: "",
              action: "unfollow",
            });
          });
        }
      }

      await TrackedAccountModel.findOneAndUpdate(
        { ensName: ensName },
        newTrackedAccountData,
        { upsert: true, new: true }
      );

      await TweetQueueModel.insertMany(tweetQueueData);

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

function findDifferences(arrayA: string[], arrayB: string[]) {
  const mapA: { [key: string]: boolean } = {};
  const mapB: { [key: string]: boolean } = {};

  // Populate hash maps
  arrayA.forEach((item) => {
    mapA[item] = true;
  });

  arrayB.forEach((item) => {
    mapB[item] = true;
  });

  // Find items in B that are not in A
  const itemsInBNotInA = arrayB.filter((item) => !mapA[item]);

  // Find items in A that are not in B
  const itemsInANotInB = arrayA.filter((item) => !mapB[item]);

  return { itemsInBNotInA, itemsInANotInB };
}
