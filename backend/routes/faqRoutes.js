const express = require("express");
const router = express.Router();

const { getFAQ } = require("../controllers/faqController");

router.get("/", getFAQ);

module.exports = router;