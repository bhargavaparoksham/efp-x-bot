import { Express, Request, Response } from "express";
import { appClient, authLink, setUserClient } from "../services/twitterClient";
import {
  batchFetchAndStoreEFPData,
  storeOAuthData,
  storeTweets,
} from "../database/dbFunctions";
import { authMiddleware } from "../middleware/auth";
import { preloadedAccounts } from "../common/preloadedAccounts";

export function setupRoutes(app: Express): void {
  app.get("/", (req: Request, res: Response) => {
    res.send(`
      <form action="/init-auth" method="get">
        <input type="password" name="adminToken" placeholder="Enter admin token" required>
        <button type="submit">Authenticate with Twitter</button>
      </form>
    `);
  });

  app.get("/init-auth", authMiddleware, (req: Request, res: Response) => {
    res.redirect(authLink.url);
  });

  app.get("/callback", async (req: Request, res: Response) => {
    const { code, state: callbackState } = req.query;

    if (authLink.state !== callbackState) {
      return res.status(400).send("Stored tokens do not match.");
    }

    try {
      const {
        client: loggedClient,
        accessToken,
        refreshToken,
      } = await appClient.loginWithOAuth2({
        code: code as string,
        codeVerifier: authLink.codeVerifier,
        redirectUri: "http://127.0.0.1:3000/callback",
      });

      setUserClient(loggedClient);

      const userData = await loggedClient.v2.me();
      await storeOAuthData({
        userId: userData.data.id,
        accessToken,
        refreshToken: refreshToken ?? "",
      });

      res.send("Authentication successful! You can now close this window.");
    } catch (error) {
      console.error("Error during OAuth flow:", error);
      res.status(403).send("Invalid verifier or access tokens!");
    }
  });

  app.get(
    "/add-tweets",
    authMiddleware,
    async (req: Request, res: Response) => {
      const tweets = [
        "Hello, X!",
        "ENS is great!",
        "Blockchain technology is revolutionizing the world!",
        "Web3 is the future of the internet.",
        "Decentralization empowers individuals.",
      ];

      await storeTweets(tweets);
      res.send("Tweets added successfully!");
    }
  );

  app.get(
    "/add-tracked-accounts",
    authMiddleware,
    async (req: Request, res: Response) => {
      await batchFetchAndStoreEFPData(preloadedAccounts);
      res.send("Tracked accounts added successfully!");
    }
  );
}
