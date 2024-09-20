import express from "express";
import { TwitterApi } from "twitter-api-v2";
import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

// Your app's credentials from the Twitter Developer Portal
const APP_CLIENT_ID = process.env.APP_CLIENT_ID as string;
const APP_CLIENT_SECRET = process.env.APP_CLIENT_SECRET as string;

// Create a client for OAuth 2.0 flow using your app's credentials
const appClient = new TwitterApi({
  clientId: APP_CLIENT_ID,
  clientSecret: APP_CLIENT_SECRET,
});

// The scopes we need
const scopes = ["tweet.read", "tweet.write", "users.read", "offline.access"];

// Generate authentication URL
const authLink = appClient.generateOAuth2AuthLink(
  "http://127.0.0.1:3000/callback",
  { scope: scopes }
);

// Store these in your database
let codeVerifier = authLink.codeVerifier;
let state = authLink.state;

// Array to store tweets
const tweets: string[] = [
  "Hello, X!",
  "ENS is great!",
  // Add more tweets as needed
];

let currentTweetIndex = 0;
let userClient: TwitterApi;

// Function to send a tweet
async function sendTweet(): Promise<void> {
  if (!userClient) {
    console.error("User client not initialized. Please authenticate first.");
    return;
  }

  if (currentTweetIndex < tweets.length) {
    try {
      console.log(`Attempting to send tweet: ${tweets[currentTweetIndex]}`);
      await userClient.v2.tweet(tweets[currentTweetIndex]);
      console.log(`Tweet sent: ${tweets[currentTweetIndex]}`);
      currentTweetIndex++;
    } catch (error) {
      console.error("Error sending tweet:", error);
    }
  } else {
    console.log("All tweets have been sent.");
    // Optionally, reset the index to start over
    // currentTweetIndex = 0;
  }
}

app.get("/", (req, res) => {
  res.send(`<a href="${authLink.url}">Authenticate with Twitter</a>`);
});

app.get("/callback", async (req, res) => {
  const { code, state: callbackState } = req.query;

  // Verify state
  if (state !== callbackState) {
    return res.status(400).send("Stored tokens do not match.");
  }

  try {
    const {
      client: loggedClient,
      accessToken,
      refreshToken,
    } = await appClient.loginWithOAuth2({
      code: code as string,
      codeVerifier,
      redirectUri: "http://127.0.0.1:3000/callback",
    });

    userClient = loggedClient;

    if (userClient) {
      console.log("User client initialized, starting cron job...");
      cron.schedule("*/1 * * * *", sendTweet);
    } else {
      console.error("User client is not initialized after OAuth login.");
    }

    res.send("Authentication successful! You can now close this window.");
  } catch (error) {
    console.error("Error during OAuth flow:", error);
    res.status(403).send("Invalid verifier or access tokens!");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(
    `Please visit http://localhost:${port} and authenticate with the Twitter account you want to tweet from`
  );
});
