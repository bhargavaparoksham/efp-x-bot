import mongoose, { Schema } from "mongoose";
import { OAuthData, Tweet } from "../types";

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

// Models
export const OAuthDataModel = mongoose.model<OAuthData>(
  "OAuthData",
  oauthDataSchema
);
export const TweetModel = mongoose.model<Tweet>("Tweet", tweetSchema);
