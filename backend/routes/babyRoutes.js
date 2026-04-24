const express = require("express");
const router = express.Router();

const {
  createBaby,
  getBaby,
  updateBaby,
} = require("../controllers/babyController");

router.post("/", createBaby);
router.get("/:babyId", getBaby);
router.put("/:babyId", updateBaby);

module.exports = router;