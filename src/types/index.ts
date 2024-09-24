export interface OAuthData {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export interface Tweet {
  content: string;
  sent: boolean;
}
