const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = Buffer.from(process.env.SECRET, "base64").toString("ascii");

router.get("/", async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (userList.length === 0) {
    return res.status(200).json({ success: false, message: "no records" });
  }
  res.send(userList);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    return res.status(500).json({ message: "Tidak dapat menemukan ID akun" });
  }
  res.status(200).send(user);
});

router.get("/profile/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select([
    "-passwordHash",
    "-isAdmin",
    "-merchant",
    "-description",
    "-dateCreated",
  ]);

  if (!user) {
    return res.status(500).json({ message: "Tidak dapat menemukan ID akun" });
  }
  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    village: req.body.village,
    district: req.body.district,
    regency: req.body.regency,
    province: req.body.province,
    country: req.body.country,
    merchant: req.body.merchant,
    description: req.body.description,
  });
  user = await user.save();

  if (!user) return res.status(400).send("Tidak dapat membuat akun");

  res.send(user);
});

router.put("/:id", async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      village: req.body.village,
      district: req.body.district,
      regency: req.body.regency,
      province: req.body.province,
      country: req.body.country,
      merchant: req.body.merchant,
      description: req.body.description,
    },
    { new: true }
  );

  if (!user) return res.status(400).send("Tidak dapat membuat akun");

  res.send(user);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).send("Akun tidak ditemukan");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1y" }
    );
    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("Kata sandi tidak sesuai");
  }
});

router.post("/register", async (req, res) => {
  const userExist = await User.findOne({ name: req.body.name }).exec();
  if (userExist) return res.status(409).send("Nama pengguna sudah digunakan");

  const emaiExist = await User.findOne({ email: req.body.email }).exec();
  if (emaiExist) return res.status(409).send("Email sudah digunakan");

  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    village: req.body.village,
    district: req.body.district,
    regency: req.body.regency,
    province: req.body.province,
    country: req.body.country,
    merchant: req.body.merchant,
    description: req.body.description,
  });
  user = await user.save();

  if (!user) return res.status(400).send("Tidak dapat membuat akun");

  res.status(201).json({ name: user.name, email: user.email });
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "Akun berhasil dihapus" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Akun tidak ditemukan" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    return res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

module.exports = router;
