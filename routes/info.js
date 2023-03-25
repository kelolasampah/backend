const express = require("express");
const router = express.Router();
var pjson = require("../package.json");

router.get("/", async (req, res) => {
  req.app.io
    .of("/")
    .emit("io_to_admin", {
      channel: "info",
      message: "halo mitra ada update baru nih!",
    });
  req.app.io
    .of("/")
    .emit("io_to_user", {
      channel: "info",
      message: "halo mitra ada update baru nih!",
    });
  res.status(200).json({
    name: pjson.name,
    version: pjson.version,
    build: pjson.build,
    description: pjson.description,
  });
});

module.exports = router;
