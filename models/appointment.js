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
        "9:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "12:30 PM",
        "1:00 PM",
        "1:30 PM",
        "2:00 PM",
        "2:30 PM",
        "3:00 PM",
        "3:30 PM",
        "4:00PM",
        "4:30 PM",
        "5:00 PM",
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
