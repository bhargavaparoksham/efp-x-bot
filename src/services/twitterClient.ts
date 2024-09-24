import { TwitterApi } from "twitter-api-v2";
import { appClientId, appClientSecret } from "../config";

export const appClient = new TwitterApi({
  clientId: appClientId,
  clientSecret: appClientSecret,
});

export const scopes = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
];

export const authLink = appClient.generateOAuth2AuthLink(
  "http://127.0.0.1:3000/callback",
  { scope: scopes }
);

export let userClient: TwitterApi | undefined;

export function setUserClient(client: TwitterApi): void {
  userClient = client;
}
