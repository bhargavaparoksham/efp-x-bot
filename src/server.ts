import express from "express";
import cron from "node-cron";
import {
  closeDatabaseConnection,
  connectToDatabase,
} from "./database/dbConnect";
import { port } from "./config";
import { setupRoutes } from "./routes";
import { sendTweet } from "./services/tweetService";

const app = express();

setupRoutes(app);

app.listen(port, async () => {
  await connectToDatabase();
  console.log(`Server running at http://localhost:${port}`);
  console.log(
    `Please visit http://localhost:${port} and authenticate with the Twitter account you want to tweet from`
  );

  // Start cron job
  //cron.schedule("*/1 * * * *", sendTweet);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await closeDatabaseConnection();
  process.exit(0);
});
