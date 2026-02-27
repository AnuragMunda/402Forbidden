import type { ChatRoles } from "./enums.js";

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
}

interface ChatPart {
  text: string;
}

export interface ChatMessage {
  role: ChatRoles;
  parts: ChatPart[];
}

export type ChatMessages = ChatMessage[];

export interface ParsedAiResponse {
  secret: string;
  category: string;
  difficulty: string;
  starterHint: string;
}
