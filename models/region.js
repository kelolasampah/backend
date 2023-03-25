const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema({
    kode: {
      type: String,
      required: true,
    },
    nama: {
      type: String,
      required: true,
    }
  });
  
  regionSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  regionSchema.set("toJSON", {
    virtuals: true,
  });

  exports.Region = mongoose.model("Region", regionSchema);

  