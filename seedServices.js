const mongoose = require("mongoose");
const Service = require("./models/service");

mongoose
  .connect("mongodb://127.0.0.1:27017/locshop_db")
  .then(() => {
    return Service.insertMany([
      {
        name: "Retwist",
        durationMins: 120,
        price: 120,
        description:
          "Our retwist service refreshes new growth at the roots to keep your locs neat, healthy, and well-maintained. This service includes a gentle cleanse, precise palm-rolling or interlocking (if requested), and light styling to restore definition and structure. Pricing starts at $120 and may increase based on hair length, loc thickness, and overall density, as longer or fuller locs require additional time and product.",
      },
      {
        name: "Starter Locs",
        durationMins: 120,
        price: 300,
        description:
          "This service is perfect for beginning your loc journey with intention and care. Using the comb coil method, we create clean, uniform sections and coils tailored specifically to your hair type, density, and head shape. Each set is carefully sized to ensure your locs mature beautifully and suit your desired look long-term. Pricing starts at $300 and may vary based on hair length, desired loc size, and overall density, as additional time and precision may be required.",
      },
      {
        name: "Styling",
        durationMins: 60,
        price: 75,
        description:
          "Enhance your look with custom loc styling designed to complement your retwist. This service includes styles such as two-strand twists, barrel twists, braids, and more, tailored to your desired look. Pricing starts at $75 and may increase based on style complexity, length, and time required. A retwist is required for the cleanest, longest-lasting results.",
      },
    ]);
  })
  .then((docs) => {
    console.log("Seeded Services:", docs.length);
  })
  .catch(console.error)
  .finally(() => {
    mongoose.disconnect();
  });
