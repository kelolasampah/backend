const express = require("express");
const { Location } = require("../models/location");
const axios = require("axios");
const router = express.Router();

/**
 * CLOUDS DATABASE from https://github.com/emsifa/api-wilayah-indonesia
 * fetch from public repository https://emsifa.github.io/api-wilayah-indonesia/api/
 */

async function getProvince() {
  try {
    const resp = await axios.get(
      "https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json"
    );
    return resp.data;
  } catch (err) {
    //console.error(err.response.status);
  }
}

const getRegency = async (id) => {
  try {
    const resp = await axios.get(
      `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${id}.json`
    );
    return resp.data;
  } catch (err) {
    //console.error(err.response.status);
  }
};

const getDistrict = async (id) => {
  try {
    const resp = await axios.get(
      `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${id}.json`
    );
    return resp.data;
  } catch (err) {
    //console.error(err.response.status);
  }
};

const getVillage = async (id) => {
  try {
    const resp = await axios.get(
      `https://emsifa.github.io/api-wilayah-indonesia/api/villages/${id}.json`
    );
    return resp.data;
  } catch (err) {
    //console.error(err.response.status);
  }
};

router.get("/provinces", async (req, res) => {
  const resp = await getProvince();
  if (!resp) return res.status(404).send("Provinsi tidak ditemukan");
  res.send(resp);
});

router.get("/regencies/:id", async (req, res) => {
  const resp = await getRegency(req.params.id);
  if (!resp) return res.status(404).send("Kabupaten/Kota tidak ditemukan");
  res.send(resp);
});

router.get("/districts/:id", async (req, res) => {
  const resp = await getDistrict(req.params.id);
  if (!resp) return res.status(404).send("Kecamatan tidak ditemukan");
  res.send(resp);
});

router.get("/villages/:id", async (req, res) => {
  const resp = await getVillage(req.params.id);
  if (!resp) return res.status(404).send("Desa/Kelurahan tidak ditemukan");
  res.send(resp);
});


/**
 * LOCAL DATABASE from https://github.com/edwin/database-kodepos-seluruh-indonesia
 *  - Dec 2021 - Grabbing kodepos data from BPS website (https://sig.bps.go.id/bridging-kode/index),
 */

router.get("/alt/provinces", async (req, res) => {
  const provinces = await Location.find().distinct("provinsi").sort();
  const temp = provinces.map((item, index) => {
    return {
      id: index,
      name: item,
    };
  });
  if (!temp) return res.status(404).send("Provinsi tidak ditemukan");
  res.send(temp);
});

router.get("/alt/regencies/:province", async (req, res) => {
  const regencies = await Location.find({ provinsi: req.params.province })
    .distinct("kabupaten")
    .sort();
  const temp = regencies.map((item, index) => {
    return {
      id: index,
      name: item,
    };
  });
  if (!temp) return res.status(404).send("Kabupaten/Kota tidak ditemukan");
  res.send(temp);
});

router.get("/alt/districts/:province/:regency", async (req, res) => {
  const districts = await Location.find({
    provinsi: req.params.province,
    kabupaten: req.params.regency,
  })
    .distinct("kecamatan")
    .sort();
  const temp = districts.map((item, index) => {
    return {
      id: index,
      name: item,
    };
  });
  if (!temp) return res.status(404).send("Kecamatan tidak ditemukan");
  res.send(temp);
});

router.get("/alt/villages/:province/:regency/:district", async (req, res) => {
  const villages = await Location.find({
    provinsi: req.params.province,
    kabupaten: req.params.regency,
    kecamatan: req.params.district,
  })
    .distinct("kelurahan")
    .sort();
  const temp = villages.map((item, index) => {
    return {
      id: index,
      name: item,
    };
  });
  if (!temp) return res.status(404).send("Kecamatan tidak ditemukan");
  res.send(temp);
});

router.get("/alt/villages/:province/:regency/:district/:village", async (req, res) => {
  const villages = await Location.find({
    provinsi: req.params.province,
    kabupaten: req.params.regency,
    kecamatan: req.params.district,
    kelurahan: req.params.village
  })
    .distinct("kodepos")
    .sort();
  const temp = villages.map((item, index) => {
    return {
      id: index,
      name: item,
    };
  });
  if (!temp) return res.status(404).send("Kode pos tidak ditemukan");
  res.send(temp);
});

module.exports = router;
