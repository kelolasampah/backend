const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
  icon:{
    type: String
  },
  color:{
    type: String
  }
});

groupSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

groupSchema.set("toJSON", {
  virtuals: true,
});

exports.Group = mongoose.model("Group", groupSchema);
