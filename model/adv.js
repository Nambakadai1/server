const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adv = new Schema(
  {
   /*  user_id: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    }, */
    ad_id:{
      type: Number,
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    images: {
      type: Array,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    category: {
      type: String,
    },
    weight:{
      type: Number,
    },
    unit:{
      type: String,
    },
    entity:{
      type: Array,
    },
    zipcode:{
      type: Number,
    },
    expired: {
      type: Boolean,
      default: true,
    },
   /*  charge: {
      type: Object
    }, */
    likes: {
      type: Array,
      required: true,
    },
    sub_category: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Array,
    },
    deleteDate: {
      type: Date,
    },
    deactivate: {
      type: Boolean,
      default: false,
    },/* 
    isNew:{
      type: Boolean,
      default: true
    } */
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("adv", adv);
