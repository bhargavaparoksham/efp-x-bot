export interface OAuthData {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export interface Tweet {
  content: string;
  sent: boolean;
}

export interface TrackedAccount {
  address: string;
  ensName: string;
  listTokenId: string;
  followedAccounts: string[];
  lastChecked: Date;
}

export interface TweetQueue {
  address1: string;
  ensName1: string;
  address2: string;
  ensName2: string;
  action: UserAction;
}

export type UserAction = "follow" | "unfollow" | "block";
