import type { ParsedAiResponse } from "../types/api.js";
import crypto from "crypto";

export const parseAiResponse = (response: string) => {
  const jsonResponse = JSON.parse(response);

  const parsedResponse: ParsedAiResponse = {
    secret: jsonResponse.secret,
    category: jsonResponse.category,
    difficulty: jsonResponse.difficulty,
    starterHint: jsonResponse.starter_hint,
  };
  return parsedResponse;
};

export const hash = (text: string) => {
  const secretHash = Array.from(crypto.createHash("sha256").update(text).digest());
  return secretHash;
};

