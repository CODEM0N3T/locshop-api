const router = require("express").Router();
const Appointment = require("../models/appointment");
const Service = require("../models/service");
const { SLOTS, SLOT_SIZE_MINS } = require("../slots.js");

router.get("/available", async (req, res) => {
  try {
    const { date } = req.query;
    const appointments = await Appointment.find({
      date,
      status: "booked",
    });
    const takenSlots = appointments.flatMap((a) => a.reservedSlots);

    const availableSlots = SLOTS.filter((slot) => !takenSlots.includes(slot));
    return res.status(200).json({ date, availableSlots, takenSlots });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { serviceId, slot, date } = req.body; //JSON body
    if (!serviceId || !slot || !date) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const service = await Service.findById(serviceId); //finding service id
    if (!service) {
      return res.status(404).json({ error: "Service doesn't exist" });
    }
    const serviceDuration = service.durationMins; //reading a property
    const startIndex = SLOTS.indexOf(slot);
    if (startIndex === -1) {
      return res.status(400).json({ error: "Invalid Slot" });
    }
    const slotsNeeded = Math.ceil(serviceDuration / SLOT_SIZE_MINS);
    const reservedSlots = SLOTS.slice(startIndex, startIndex + slotsNeeded);
    const conflict = await Appointment.findOne({
      date,
      status: "booked",
      reservedSlots: { $in: reservedSlots },
    });
    if (reservedSlots.length !== slotsNeeded) {
      return res.status(400).json({ error: "Past Closing Time" });
    }
    if (conflict) {
      return res.status(409).json({ error: "Taken Slot", reservedSlots });
    }
    const newAppointment = new Appointment({
      ...req.body,
      reservedSlots,
      status: "booked",
    }); //creates a new appointment

    const saveAppointment = await newAppointment.save(); //saves and validates appointment
    return res.status(201).json(saveAppointment); //responds to client with appoinment doc
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
