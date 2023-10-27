import mongoose from "mongoose";

const pmsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: 40,
      required: true,
    },
    status: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Pms", pmsSchema);
