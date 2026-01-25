const Service = require("../models/service");
const router = require("express").Router();

router.get("/", async (req, res) => {
  const services = await Service.find();
  res.send(services);
});

router.post("/", (req, res) => {
  res.send("POST request to the homepage");
});

module.exports = router;
