import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AdminConfig } from "../models/AdminConfig.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/tokens.js";

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferences: user.preferences
  };
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(409, "Email already registered");
  }

  const isFirstUser = (await User.countDocuments()) === 0;
  const user = await User.create({
    name,
    email,
    password,
    role: isFirstUser ? "admin" : "user"
  });
  await AdminConfig.updateOne(
    { singletonKey: "global" },
    {
      $setOnInsert: {
        singletonKey: "global",
        aiProviders: [
          { key: "openai", label: "OpenAI", enabled: true, isDefault: true },
          {
            key: "anthropic",
            label: "Claude",
            enabled: true,
            isDefault: false
          }
        ],
        notebookTemplates: [
          {
            name: "Research Brief",
            description: "Summarize sources and identify decisions.",
            starterPrompts: ["What are the key claims?", "What are the risks?"]
          }
        ]
      }
    },
    { upsert: true }
  );

  const token = signToken({ sub: user._id, role: user.role }, env.jwtSecret, env.jwtExpiresIn);
  res.status(201).json({ token, user: serializeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  const token = signToken({ sub: user._id, role: user.role }, env.jwtSecret, env.jwtExpiresIn);
  res.json({ token, user: serializeUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});
