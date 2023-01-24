const express = require("express");
const Unit = require("../model/units");
var router = express.Router();
const Joi = require("@hapi/joi");
const config = require("../config");

router.post("/", async (req, res) => {
  const data = req.body;
  const schema = Joi.object({
    unit: Joi.string().required(),
    name: Joi.string().required(),
  });
  try {
    let value = await schema.validateAsync(data);
    const unit = data.unit;
   // console.log("name", name);
    if (!value.error) {
        const existUnit = await Unit.findOne({ unit: unit });
        if(existUnit)
        {
            res.status(200).json({ status: false, message: 'Unit Already Exist' });
        }else{
              let unit = new Unit(data);
              unit.save();
              res.status(200).json({ status: true, message: 'Unit Added Successfully.', unit_id: unit.id });
        }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
});


router.get("/", async (req, res) => {
  try {
     let unit = await Unit.find().
     select({
      "_id": true, 
      "unit": true,
      "name": true
    })
      .sort({ _id: -1 });
    res.status(200).json(unit);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

router.get("/:unit_id", async (req, res) => {
  const { unit_id } = req.params;
  try {
   //  let unit = await Unit.find({category: {$all: [category]}})
   let unit = await Unit.find({_id: unit_id})
     .select({
      "_id": true, 
      "unit": true
    })
      .sort({ _id: -1 });
     res.status(200).json(unit);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

router.put("/:unit_id", async (req, res) => {
  const { unit_id } = req.params;
  const data = req.body;
  try {
    await Unit.findByIdAndUpdate(unit_id,{ $set: data },{ new: true });
    res.status(200).json({ status: true, message: 'Unit Updated Successfully.' });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/", async (req, res) => {
  const data = req.body;
  try {
    const schema = Joi.object({
      ids: Joi.array().required(),
      email: Joi.string().required(),
    });

    const value = await schema.validateAsync(data);
    if (!value.error) {
      const email = data.email;
      if (email != config.nambakadai_admin) {
        return res
          .status(200)
          .json({ error: true, message: "You can not perform this operation" });
      }

      let ids = data.ids;
      for (let i = 0; i < ids.length; i++) {
        await Unit.findByIdAndUpdate(
          ids[i],
          { $set: { deleted: true } },
          { new: true }
        );
       //await Category.findByIdAndRemove(ids[i]);
       //await Category.deleteMany({"ancestors._id": ids[i]});
      }

      res.status(200).json({
        error: true,
        message: "Successfully deleted",
      });
    }
  } catch (err) {
    console.log(err);

    res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});

module.exports = router;
