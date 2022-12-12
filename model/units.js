const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const unit = new Schema({
    unit:{
        type: String,
        required:true
    },
    category:{
      type: Array,
      required: true
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