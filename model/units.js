const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const unit = new Schema({
    name:{
      type: String,
      required:true
    },
    unit:{
        type: String,
        required:true
    },
    deleted:{
      type: Boolean,
      default: false
    }
 },   
 {
  timestamps : true
 }
);

module.exports = mongoose.model('unit', unit);