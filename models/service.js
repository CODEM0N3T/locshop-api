const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  durationMins: {
    type: Number,
    required: true,
    min: 30,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Service = mongoose.model("Service", serviceSchema);
 module.exports = Service;
// console.log(Service);
