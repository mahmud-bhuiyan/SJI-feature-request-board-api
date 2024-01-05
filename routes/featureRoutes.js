const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

const {
  createRequest,
  getAllRequest,
} = require("../controllers/featureController");

router.route("/").post(auth, createRequest).get(auth, getAllRequest);

module.exports = router;
