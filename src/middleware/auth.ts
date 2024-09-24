import { Request, Response, NextFunction } from "express";
import { adminToken } from "../config";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const headerToken = req.headers["x-admin-token"];
  const queryToken = req.query.adminToken;

  if (headerToken === adminToken || queryToken === adminToken) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}
