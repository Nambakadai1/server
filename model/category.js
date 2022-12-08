const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv1 = require("uuid");
const passwordHash = require("password-hash");


const category = new Schema({
    category:{
        type: String,
        required:true
    },
    parent_category: {
      type: String
    },
    images: {
      type: Array,
    },
}   
,{
  timestamps : true
  }
);

module.exports = mongoose.model('category', category);