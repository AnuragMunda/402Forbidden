import mongoose, { Schema } from "mongoose";
import { secretDifficulty } from "../types/enums.js";

const arenaSchema = new Schema(
  {
    arenaId: {
      type: Number,
      required: true,
      unique: true,
    },
    hint: {
      type: String,
      required: true,
    },
    secret: {
      type: String,
      required: true,
      unique: true,
    },
    difficulty: {
      type: String,
      enum: secretDifficulty,
    },
    category: {
      type: String,
    }
  },
  { timestamps: true },
);

export const Arena = mongoose.model("Arena", arenaSchema);
