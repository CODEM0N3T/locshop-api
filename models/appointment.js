const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    slot: {
      type: String,
      enum: [
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "1:00",
        "1:30",
        "2:00",
        "2:30",
        "3:00",
        "3:30",
        "4:00",
        "4:30",
        "5:00",
      ],
      required: true,
    },
    reservedSlots: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
      required: true,
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ date: 1, slot: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
