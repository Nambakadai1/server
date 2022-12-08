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
    name: Joi.string().required(),
    parent: Joi.string(),
    images: Joi.array()
  });
  try {
    let value = await schema.validateAsync(data);
    const name = data.name;
   // console.log("name", name);
    if (!value.error) {
        const existCategory = await Category.findOne({ category:name });
      //  console.log("existCategory", existCategory);
        const parent = req.body.parent ? req.body.parent : null;
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
              await buildAncestors(category.id, parent);
              res.status(200).json({ status: true, message: 'Category Added Successfully.', category_id: category.id });
        }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
});


router.get("/", async (req, res) => {
  try {
     let category = await Category.find().select({
      "_id": true, 
      "name": true,
      "parent": true,
      "ancestors.slug": true,
      "ancestors.name": true })
      .sort({ _id: -1 });
      /* let category = await Category.aggregate([
        {
            $sort: { order: 1 }
        },
        {
            $graphLookup: {
                from: 'categories',
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parent',
                as: 'children'
            }
        },
        {
            $match: {
                parent: null
            }
        }
    ]); */
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

router.get("/:parent_category", async (req, res) => {
  const { parent_category } = req.params;
  console.log("parent_category", parent_category);
  try {
     let category = await Category.find().select({
      "_id": true, 
      "name": true,
      "parent": true,
      "ancestors.slug": true,
      "ancestors.name": true })
      .sort({ _id: -1 });
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

const buildAncestors = async (id, parent_id) => {
  let ancest = [];
  try {
      let parent_category = await Category.findOne({ "_id":    parent_id },{ "name": 1, "slug": 1, "ancestors": 1 }).exec();
if( parent_category ) {
         const { _id, name, slug } = parent_category;
         const ancest = [...parent_category.ancestors];
         ancest.unshift({ _id, name, slug })
         const category = await Category.findByIdAndUpdate(id, { $set: { "ancestors": ancest } });
       }
    } catch (err) {
        console.log(err.message)
     }
}

module.exports = router;
