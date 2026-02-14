const router = require("express").Router();
const Appointment = require("../models/appointment"); //Appointment Schema
const Service = require("../models/service"); //Service Schema, needed specifice data to be able to ook appointments
const { SLOTS, SLOT_SIZE_MINS } = require("../slots.js"); //slot times

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
  //post request
  try {
    const { serviceId, slot, date } = req.body; //JSON body
    if (!serviceId || !slot || !date) {
      // validate that serviceId, slot, and date exist
      return res.status(400).json({ error: "Missing fields" }); //Bad request
    }
    const service = await Service.findById(serviceId); //finding service id in Service DB
    if (!service) {
      return res.status(404).json({ error: "Service doesn't exist" }); //Service Not Found
    }
    const serviceDuration = service.durationMins; //reading service property duration of service
    const startIndex = SLOTS.indexOf(slot); //finds the start index of slot
    if (startIndex === -1) {
      return res.status(400).json({ error: "Invalid Slot" }); //Bade request
    }
    const slotsNeeded = Math.ceil(serviceDuration / SLOT_SIZE_MINS); //calculates the amount of slots needed, slots are 30 mins each, ceil to round up 4:15 rounds to 4:30
    const reservedSlots = SLOTS.slice(startIndex, startIndex + slotsNeeded); //reserved slots including start index -> start index + slots needed
    const conflict = await Appointment.findOne({
      date,
      status: "booked",
      reservedSlots: { $in: reservedSlots },
    }); //checks if the database already has an appointment reserved at date
    if (reservedSlots.length !== slotsNeeded) {
      //if the reserved slot is past the slot needed it is past closing time
      return res.status(400).json({ error: "Past Closing Time" }); //Bad request
    }
    if (conflict) {
      return res.status(409).json({ error: "Taken Slot", reservedSlots }); //if conflict error request conflict
    }
    const newAppointment = new Appointment({
      ...req.body,
      reservedSlots,
      status: "booked",
    }); //creates a new appointment if everything checks

    const saveAppointment = await newAppointment.save(); //saves and validates appointment
    return res.status(201).json(saveAppointment); //responds to client with appoinment doc
  } catch (error) {
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

    return res.status(200).json(updateCancel); //send updated doc
  } catch (error) {
    return res.status(400).json({ error: error.message }); //bad request
  }
});
module.exports = router;
