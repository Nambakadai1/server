const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv1 = require("uuid");
const passwordHash = require("password-hash");


const category = new Schema({
    name:{
        type: String,
        required:true
    },
    slug: { type: String, index: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    ancestors: [{
      _id: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        index: true
    },
      name: String,
      slug: String
    }],
    images: {
      type: Array,
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

function slugify(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

category.pre('save', async function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model('category', category);