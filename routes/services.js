const Service = require("../models/service");
const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const serviceData = req.body; //JSON body
    const newService = new Service(serviceData); //create new service
    const savedService = await newService.save(); //save service to db
    res.status(201).json(savedService); //return/respond with the created document and 201 status
  } catch (error) {
    res.status(400).json({ message: error.message }); //handle errors
  }

});

module.exports = router;
