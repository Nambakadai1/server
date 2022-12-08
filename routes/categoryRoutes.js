const express = require("express");
const Category = require('../model/category');
var router = express.Router();
const Joi = require("@hapi/joi");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image');
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    },

});

const upload = multer({ storage: storage });

router.post("/", upload.array("images", 5), async (req, res) => {
  const data = req.body;
  const schema = Joi.object({
    category: Joi.string().required(),
    parent_category: Joi.string(),
    images: Joi.array()
  });
  try {
    let value = await schema.validateAsync(data);
    const name = data.category;
   // console.log("name", name);
    if (!value.error) {
        const existCategory = await Category.findOne({ category:name });
      //  console.log("existCategory", existCategory);
        if(existCategory)
        {
            res.status(200).json({ status: false, message: 'Category Already Exist' });
        }else{
            if (req.files) {
                let file = req.files;
                let images = [];
                file.map((text) => {
                     console.log("text", text);
                  images = [...images, text.path];
                });
                data["images"] = images;
              } else {
                data["images"] = data.images;
              }
              let category = new Category(data);
              category.save();
              res.status(200).json({ status: true, message: 'Category Added Successfully.', category_id: category.id });
        }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
});

module.exports = router;
