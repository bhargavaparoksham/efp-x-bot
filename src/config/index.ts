import dotenv from "dotenv";

dotenv.config();

export const port = 3000;
export const mongoUri = process.env.MONGODB_URI as string;
export const dbName = process.env.DB_NAME as string;
export const appClientId = process.env.APP_CLIENT_ID as string;
export const appClientSecret = process.env.APP_CLIENT_SECRET as string;
export const adminToken = process.env.ADMIN_TOKEN as string;

if (!mongoUri || !dbName || !appClientId || !appClientSecret || !adminToken) {
  throw new Error("Missing required environment variables");
}
