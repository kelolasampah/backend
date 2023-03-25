const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    kelurahan: {
      type: String,
      required: true,
    },
    kecamatan: {
      type: String,
      required: true,
    },
    kabupaten: {
      type: String,
      required: true,
    },
    provinsi: {
      type: String,
      required: true,
    },
    kodepos: {
      type: String,
      required: true,
    }
  });
  
  locationSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  locationSchema.set("toJSON", {
    virtuals: true,
  });

  exports.Location = mongoose.model("Location", locationSchema);

  