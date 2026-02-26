import mongoose, { Schema } from "mongoose";
import { ChatRoles } from "../types/enums.js";
import { initialIntro } from "../constants/guradianConfig.js";

const arenaUserSchema = new Schema(
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
      type: [
        {
          role: ChatRoles,
          parts: [{ text: String }],
        },
      ],
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

arenaUserSchema.index({ arenaId: 1, userAddress: 1 }, { unique: true });

// Appends chats to the model
arenaUserSchema.statics.appendChat = function (
  arenaId: number,
  userAddress: string,
  role: ChatRoles,
  text: string,
) {
  return this.findOneAndUpdate(
    { arenaId, userAddress },
    {
      $push: {
        chats: {
          role,
          parts: [{ text }],
        },
      },
    },
    { new: true, upsert: true },
  );
};

// Finds user for a particular arena
arenaUserSchema.statics.findByArenaAndUser = function (arenaId: number, userAddress: string) {
  return this.findOne({ arenaId, userAddress });
};

// Finds user for an arena or creates one if not found
arenaUserSchema.statics.findOrCreate = async function (arenaId: number, userAddress: string) {
  let doc = await this.findOne({ arenaId, userAddress });

  if (!doc) {
    doc = await this.create({ arenaId, userAddress });
  }

  return doc;
};

export const ArenaUser = mongoose.model("ArenaUser", arenaUserSchema);
