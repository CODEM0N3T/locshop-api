const mongoose = require("mongoose");
// const Appointment = require("./models/appointment");

const bookedSlotSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
  },
  { timestamps: true },
);

bookedSlotSchema.index({ date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model("BookedSlot", bookedSlotSchema);
