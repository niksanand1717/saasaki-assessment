import mongoose, { Model, Schema } from "mongoose";

const recordSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    series: {
      type: String,
      required: true,
    },
    prev_close: {
      type: Number,
      required: true,
    },
    open: {
      type: Number,
      required: true,
    },
    high: {
      type: Number,
      required: true,
    },
    low: {
      type: Number,
      required: true,
    },
    last: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
      required: true,
    },
    vwap: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    turnover: {
      type: Number,
      required: true,
    },
    trades: {
      type: Number,
      required: true,
    },
    deliverable: {
      type: Number,
      required: true,
    },
    percentage_deliverable: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const RecordModel =
  mongoose.model.record || mongoose.model("stock_data", recordSchema);
