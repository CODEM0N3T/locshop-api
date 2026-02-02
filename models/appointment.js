const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true,
  },
  clientEmail: {
    type: String,
    required: true,
    unique: true,
  },
  serviceId: {},
  date: {},
  slot: {},
  status: {},
  timestanps: {},
});
