require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const appointmentsRouter = require("./routes/appointments");
const servicesRouter = require("./routes/services");
const app = express();
const { PORT = 3004 } = process.env;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API is running"));
app.use("/services", servicesRouter);
app.use("/appointments", appointmentsRouter);
//created and connected to mongoDB database
mongoose
  .connect("mongodb://127.0.0.1:27017/locshop_db")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

//start server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
