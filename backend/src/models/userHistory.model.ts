import mongoose, { Schema } from "mongoose";
import { ChatRoles } from "../types/enums.js";
import { initialIntro } from "../constants/guradianConfig.js";

const chatSchema = new Schema({
  role: {
    type: String,
    enum: ChatRoles,
  },
  parts: [{ text: String }],
});

const userHistorySchema = new Schema(
  {
    arenaId: {
      type: Number,
      required: true,
    },
    userAddress: {
      type: String,
      required: true,
    },
    chats: {
      type: [chatSchema],
      default: [
        {
          role: ChatRoles.MODEL,
          parts: [
            {
              text: initialIntro,
            },
          ],
        },
      ],
    },
  },
  { timestamps: true },
);

userHistorySchema.index({ arenaId: 1, userAddress: 1 }, { unique: true });

export const UserHistory = mongoose.model("UserHistory", userHistorySchema);
