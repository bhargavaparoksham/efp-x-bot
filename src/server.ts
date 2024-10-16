import express from "express";
import cron from "node-cron";
import {
  closeDatabaseConnection,
  connectToDatabase,
} from "./database/dbConnect";
import { port } from "./config";
import { setupRoutes } from "./routes";
import { sendTweet, sendTweets } from "./services/tweetService";
import { preloadedAccounts } from "./common/preloadedAccounts";
import { batchFetchAndStoreEFPData } from "./services/efpDataService";

const app = express();

setupRoutes(app);

app.listen(port, async () => {
  await connectToDatabase();
  console.log(`Server running at http://localhost:${port}`);
  console.log(
    `Please visit http://localhost:${port} and authenticate with the Twitter account you want to tweet from`
  );

  // Start cron job
  cron.schedule("0 */3 * * *", async () => {
    await batchFetchAndStoreEFPData(preloadedAccounts);
  });
  cron.schedule("0 */6 * * *", sendTweets);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await closeDatabaseConnection();
  process.exit(0);
});
