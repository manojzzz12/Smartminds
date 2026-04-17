import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export async function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select("+password");
    if (!user) {
      next(new ApiError(401, "User not found"));
      return;
    }
    req.user = user;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export function authorize(...roles) {
  return function roleGate(req, _res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, "Access denied"));
      return;
    }
    next();
  };
}
