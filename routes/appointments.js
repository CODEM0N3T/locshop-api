const router = require("express").Router();
const mongoose = require("mongoose");
const Appointment = require("../models/appointment"); //Appointment Schema
const Service = require("../models/service"); //Service Schema, needed specifice data to be able to ook appointments
const { SLOTS, SLOT_SIZE_MINS } = require("../slots.js"); //slot times
const BookedSlot = require("../models/bookedSlot");

router.get("/available", async (req, res) => {
  //get request logic to the server
  try {
    const { date } = req.query; // need to access individual values
    const appointments = await Appointment.find({
      date,
      status: "booked",
    }); //searches the DB for booked appointments at date
    const takenSlots = appointments.flatMap((a) => a.reservedSlots); //an array of taken/reserved appointments

    const availableSlots = SLOTS.filter((slot) => !takenSlots.includes(slot)); //filters out taken slots and stores those that are not taken
    return res.status(200).json({ date, availableSlots, takenSlots }); //sends ok status, returns date, available slots, and taken slots to user
  } catch (error) {
    return res.status(500).json({ error: error.message }); //Server error
  }
});

router.get("/", async (req, res) => {
  //Return all appointments, or only appointments for a specific date
  try {
    const { date } = req.query; //Extract date from query string

    const filter = {}; //build a filter object for MongoDB query, if no date is provided, filter stays empty, returns all appointments
    if (date) filter.date = date; //only return appointments matching this date

    const appointments = await Appointment.find(filter).sort({ slot: 1 }); //query database using filter, sort appointments by time slot ascending, earliest first

    return res.status(200).json(appointments); //sends successs response with appointmets array
  } catch (error) {
    return res.status(500).json({ error: error.message }); //server error
  }
});

router.post("/", async (req, res) => {
  const session = await mongoose.startSession();

  //post request
  try {
    session.startTransaction();
    const { serviceId, slot, date } = req.body; //JSON body

    if (!serviceId || !slot || !date) {
      // validate that serviceId, slot, and date exist
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Missing fields" }); //Bad request
    }

    const service = await Service.findById(serviceId).session(session); //finding service id in Service DB

    if (!service) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Service doesn't exist" }); //Service Not Found
    }

    const startIndex = SLOTS.indexOf(slot); //finds the start index of slot

    if (startIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid Slot" }); //Bade request
    }

    const slotsNeeded = Math.ceil(service.durationMins / SLOT_SIZE_MINS); //calculates the amount of slots needed, slots are 30 mins each, ceil to round up 4:15 rounds to 4:30
    const reservedSlots = SLOTS.slice(startIndex, startIndex + slotsNeeded); //reserved slots including start index -> start index + slots needed

    if (reservedSlots.length !== slotsNeeded) {
      //if the reserved slot is past the slot needed it is past closing time
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Past Closing Time" }); //Bad request
    }

    const savedAppointment = await Appointment.create(
      [
        {
          ...req.body,
          reservedSlots,
          status: "booked",
        },
      ],
      { session },
    ); //create appointment

    const slotDocs = reservedSlots.map((s) => ({
      date,
      slot: s,
      appointmentId: savedAppointment[0]._id,
    }));

    await BookedSlot.insertMany(slotDocs, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(savedAppointment[0]); //responds to client with appoinment doc
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error && error.code === 11000) {
      return res.status(409).json({ error: "Taken Slot" }); //Bad request
    }

    return res.status(400).json({ error: error.message }); //Bad request
  }
});

router.patch("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id); //Find appointment by id
    if (!appointment) {
      return res.status(404).json({ error: "Appointment Not Found" }); //cheks if the appointment exists
    }
    if (appointment.status === "completed") {
      return res
        .status(409)
        .json({ error: "Can't cancel completed appointments" });
    } //checks if appointment is alreday completed
    if (appointment.status === "cancelled") {
      return res.status(200).json(appointment);
    } //checks if appointment is already cancelled
    const updateCancel = await Appointment.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true },
    ); //finds by id, cancels, and updates
    if (!updateCancel) {
      return res.status(404).json({ error: "Appointment Not Found" });
    } //if not found

    await BookedSlot.deleteMany({ appointmentId: id });
    return res.status(200).json(updateCancel); //send updated doc
  } catch (error) {
    return res.status(400).json({ error: error.message }); //bad request
  }
});
module.exports = router;
