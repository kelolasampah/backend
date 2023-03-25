const { Group } = require("../models/group");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const groupList = await Group.find();

  if (!groupList) {
    return res.status(404 /*204*/).json({ success: false, message: "Cannot find any group records." });
  }

  res.status(200).send(groupList);
});

router.get("/:id", async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group)
    return res
      .status(404 /*204*/)
      .send({
        success: false,
        message: "The group with the given ID was not found.",
      });

  res.status(200).send(group);
});

router.get("/:type", async (req, res) => {
  const group = await Group.find({ type: req.params.type });

  if (!group)
    return res.status(404 /*204*/).json({
      success: false,
      message: "The group with the given type was not found.",
    });

  res.status(200).send(group);
});

router.post("/", async (req, res) => {
  let group = new Group({
    name: req.body.name,
    type: req.body.type,
    icon: req.body.icon,
    color: req.body.color,
  });
  group = await group.save();

  if (!group) return res.status(400).send("The group cannot be created!");

  res.send(group);
});

router.put("/:id", async (req, res) => {
  const group = await Group.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      type: req.body.type,
      icon: req.body.icon || group.icon,
      color: req.body.color || group.color,
    },
    {
      new: true,
    }
  );

  if (!group) return res.status(400).send("The group cannot be created!");

  res.send(group);
});

router.delete("/:id", async (req, res) => {
  Group.findByIdAndRemove(req.params.id)
    .then((group) => {
      if (group) {
        return res
          .status(200)
          .json({ success: true, message: "The group is deleted." });
      } else {
        return res
          .status(404 /*204*/)
          .json({ success: false, message: "Group not found." });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

module.exports = router;
