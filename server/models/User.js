import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, index: true },
    name: String,
    avatar: String,

    providers: {
      googleId: String,
      githubId: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
