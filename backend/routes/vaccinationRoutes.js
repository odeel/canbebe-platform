const express = require("express");
const router = express.Router();

const {
  getVaccination,
  updateVaccine,
} = require("../controllers/vaccinationController");

router.get("/:babyId", getVaccination);
router.put("/:babyId", updateVaccine);

module.exports = router;