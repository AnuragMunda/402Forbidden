import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { secretGenerationInstruction, systemInstruction } from "../constants/guradianConfig.js";
import type { ChatMessages } from "../types/api.js";
import type { secretDifficulty } from "../types/enums.js";

const ai = new GoogleGenAI({});

// Utility function to chat with the guardian
export const guardian = async (input: string, history: ChatMessages, secret: string) => {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `${systemInstruction}\n
      --------------------------------
      THE SECRET
      --------------------------------
      The secret password is: ${secret}`,
    },
    history,
  });

  const response = await chat.sendMessage({
    message: input,
  });

  return response;
};

// Utility function to generate password and hint
export const generateSecret = async (level: secretDifficulty) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a new secret with difficulty level of ${level}`,
    config: {
      systemInstruction: secretGenerationInstruction,
    },
  });

  return response;
};
