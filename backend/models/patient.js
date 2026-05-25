const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null,
    },

    phone: {
      type: String,
      required: true,
    },

    queueNumber: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "waiting", "called", "done", "cancelled"],
      default: "pending",
    },

    date: {
      type: String,
      required: true,
    },

    pending: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

patientSchema.index({ phone: 1, date: 1 });

module.exports = mongoose.model("Patient", patientSchema);
