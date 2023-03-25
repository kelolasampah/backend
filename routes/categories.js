const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList)
    return res
      .status(404 /*204*/)
      .json({ success: false, essage: "Cannot find any category records." });

  res.status(200).send(categoryList);
});

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category)
    return res.status(404 /*204*/).json({
      success: false,
      message: "The category with the given ID was not found.",
    });

  res.status(200).send(category);
});

router.get("/type/:type", async (req, res) => {
  const category = await Category.find({ type: req.params.type });

  if (!category)
    return res.status(404 /*204*/).json({
      success: false,
      message: "The category with the given type name was not found.",
    });

  res.status(200).send(category);
});

router.get("/groupid/:groupid", async (req, res) => {
  const category = await Category.find({ group: req.params.groupid });

  if (!category)
    return res.status(404 /*204*/).json({
      success: false,
      message: "The category with the given group id was not found.",
    });

  res.status(200).send(category);
});

router.get("/grouptype/:grouptype", async (req, res) => {
  let query = await Category.find().populate({
    path: "group",
    match: { type: req.params.grouptype },
  });
  const category = query.filter((t) => t.group !== null);

  /** cost less time */
  // const category = await Category.aggregate([
  //   {
  //     $lookup: {
  //       from: "groups",
  //       localField: "group",
  //       foreignField: "_id",
  //       as: "group"
  //     }
  //   },
  //   {
  //     $addFields: {
  //       group: {
  //         $arrayElemAt: [
  //           "$group",
  //           0
  //         ]
  //       }
  //     }
  //   },
  //   {
  //     $match: {
  //       "group.type": parseInt(req.params.grouptype)
  //     }
  //   }
  // ])

  if (!category)
    return res.status(404 /*204*/).json({
      success: false,
      message: "The category with the given group type was not found.",
    });

  res.status(200).send(category);
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    type: req.body.type,
    group: req.body.group,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();

  if (!category) return res.status(400).send("The category cannot be created!");

  res.send(category);
});

router.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      type: req.body.type,
      group: req.body.group,
      icon: req.body.icon || category.icon,
      color: req.body.color || category.color,
    },
    { new: true }
  );

  if (!category) return res.status(400).send("The category cannot be created!");

  res.send(category);
});

router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "The category is deleted." });
      } else {
        return res
          .status(404 /*204*/)
          .json({ success: false, message: "Category not found." });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

module.exports = router;
