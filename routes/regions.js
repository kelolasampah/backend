const express = require("express");
const router = express.Router();
const { Region } = require("../models/region");

/**
 * DATA SOURCE https://github.com/cahyadsn/wilayah
 *  - wilayah_2022.sql sesuai Permendagri No 58 Tahun 2021 (revised by Kepmendagri No. 050-145 Tahun 2022)
 */

router.get("/provinces", async (req, res) => {
  const provinces = await Region.find({
    kode: { $exists: true },
    $expr: { $eq: [{ $strLenCP: "$kode" }, 2] },
  }).sort("nama");

  if (!provinces) return res.status(404).send("Provinsi tidak ditemukan");
  res.send(provinces);
});

router.get("/regencies/:id", async (req, res) => {
  const regencies = await Region.find({
    kode: { $exists: true },
    $expr: { $eq: [{ $strLenCP: "$kode" }, 5] },
    kode: { $regex: `${req.params.id}.` },
  }).sort("nama");

  if (!regencies) return res.status(404).send("Kab/Kota tidak ditemukan");
  res.send(regencies);
});

router.get("/districts/:id", async (req, res) => {
  const districts = await Region.find({
    kode: { $exists: true },
    $expr: { $eq: [{ $strLenCP: "$kode" }, 8] },
    kode: { $regex: `${req.params.id}.` },
  }).sort("nama");

  if (!districts) return res.status(404).send("Kecamatan tidak ditemukan");
  res.send(districts);
});

router.get("/villages/:id", async (req, res) => {
  const villages = await Region.find({
    kode: { $exists: true },
    $expr: { $gt: [{ $strLenCP: "$kode" }, 8] },
    kode: { $regex: `${req.params.id}.` },
  }).sort("nama");

  if (!villages) return res.status(404).send("Kelurahan tidak ditemukan");
  res.send(villages);
});

module.exports = router;
