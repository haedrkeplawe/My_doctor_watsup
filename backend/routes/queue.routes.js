const express = require("express");
const router = express.Router();
const {
  getQueue,
  callNext,
  markDone,
  cancelPatient,
  getCurrentQueue,
  callPatient,
  resetQueue,
} = require("../controllers/queue.controller");

router.get("/", getQueue);
router.get("/current", getCurrentQueue); // ← جديد
router.post("/call-next", callNext);
router.post("/reset", resetQueue);
router.patch("/:id/done", markDone);
router.patch("/:id/cancel", cancelPatient);
router.patch("/:id/call", callPatient);

module.exports = router;
