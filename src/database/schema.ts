import mongoose, { Schema } from "mongoose";
import { OAuthData, TrackedAccount, Tweet, TweetQueue } from "../types";

// OAuthData Schema
const oauthDataSchema = new Schema<OAuthData>({
  userId: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
});

// Tweet Schema
const tweetSchema = new Schema<Tweet>({
  content: { type: String, required: true },
  sent: { type: Boolean, default: false },
});

const trackedAccountsSchema = new Schema<TrackedAccount>({
  address: { type: String, required: true },
  ensName: { type: String, required: true },
  listTokenId: { type: String, required: true },
  followedAccounts: { type: [String], default: [] },
  lastChecked: { type: Date, default: Date.now },
});

const tweetQueueSchema = new Schema<TweetQueue>({
  address1: { type: String, required: true },
  ensName1: { type: String, required: true },
  address2: { type: String, required: true },
  ensName2: { type: String, required: true },
  action: { type: String, required: true },
});

// Models
export const OAuthDataModel = mongoose.model<OAuthData>(
  "OAuthData",
  oauthDataSchema
);
export const TweetModel = mongoose.model<Tweet>("Tweet", tweetSchema);

export const TrackedAccountModel = mongoose.model<TrackedAccount>(
  "TrackedAccount",
  trackedAccountsSchema
);

export const TweetQueueModel = mongoose.model<TweetQueue>(
  "TweetQueue",
  tweetQueueSchema
);
