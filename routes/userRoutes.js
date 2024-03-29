const express = require("express");
const User = require("../model/user");
const middlewear = require("../middleware");
var router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../config");
const Joi = require("@hapi/joi");
const crypto = require("crypto");
const path = require("path");
const Adv = require("../model/adv");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/image');
  },

  filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname)
  },

});

const Upload = multer({ storage: storage });

const link = `http://3.13.217.144:4000/api/user/verify/`;

router.post("/signup", async (req, res) => {
  const data = req.body;
  console.log("post", data);
  try {
    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().min(8).required(),
      mobile: Joi.string().min(10).required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
    });

    const value = await schema.validateAsync(data);
    if (!value.error) {
      const { username, mobile } = req.body;
      const existMobile = await User.findOne({ mobile });
      const existUser = await User.findOne({ username });
      console.log("exsist", existMobile);
      if (existMobile || existUser) {
        console.log({ existMobile, existUser });
        return res
          .status(403)
          .json({ message: "Mobile or Username Already exists", error: true });
      }
      // const existUser = await User.findOne({ username });
      // if (existUser) {

      //   return res.status(403).json({ message: "Username Already exists", error: true });
      // }
      else {
        let token = crypto.randomBytes(3);
        token = token.toString("hex");
        console.log("start");
        data["token"] = token;
        let user = new User(data);
        user.save((err, user) => {
          console.log(err, user, "saveuser");
          if (!err) {
            user.salt = undefined;
            user.hash_password = undefined;
            console.log("done", user);
            
            res.status(200).json({
              message: "Your Account is Successfully Created",
              data: user,
              error: false,
            });
          } else {
            res.status(400).json({ error: true, message: err });
          }
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message,
      error: true,
    });
  }
});

router.put("/:user_id", Upload.single("profile_picture"), async (req, res) => {
  const data = req.body;

  try {
    const schema = Joi.object({
      password: Joi.string(),
      first_name: Joi.string(),
      last_name: Joi.string(),
      profile_picture: Joi.string(),
      deleted: Joi.boolean(),
      notification: Joi.boolean(),
      email_notification: Joi.boolean(),
    });
    const { user_id } = req.params;
    const value = await schema.validateAsync(data);
    if (!value.error) {
      if (req.file) {
        data["profile_picture"] = req.file.location;
      } else {
        data["profile_picture"] = data.profile_picture;
      }
      const user = await User.findByIdAndUpdate(
        user_id,
        {
          $set: data,
        },
        { new: true },
      );

      res.status(200).json(user);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message,
      error: true,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    let per_page = 30;
    let page = 1;
    req.query.page ? (page = req.query.page) : null;
    let user;
    req.query.name
      ? (user = await User.find({
        deleted: { $ne: true },
        first_name: { $regex: req.query.name },
      })
        .skip(per_page * page - per_page)
        .limit(50)
        .select("username , first_name , last_name , email"))
      : (user = await User.find({ deleted: { $ne: true } })
        .sort({ _id: -1 })
        .skip(per_page * page - per_page)
        .limit(50)
        .select("username , first_name , last_name , email"));
    //{deleted :{$ne:true}}
    res.status(200).json({
      error: false,
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findOne({ _id: user_id });
    if (user) {
      console.log(user, "SUCCESS");
      res.status(200).json({
        data: user,
      });
    } else {
      console.log("fix api");
      return res.status(404).json({
        error: true,
        message: "user not found",
      });
    }
  } catch (err) {
    return res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});

router.post("/login", async (req, res, err) => {
  console.log("hi", req);
  let data = req.body;
  const schema = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().required(),
    token: Joi.string(),
  });
  console.log(data, "running");
  try {
    const value = await schema.validateAsync(data);
    if (!value.error) {
      let user;
      user = await User.findOne({ email: data.email, deleted: { $ne: true } });
      console.log(user, "FINDED")
      if (!user) {
        console.log("S");
        user = await User.findOne({
          username: data.email,
          deleted: { $ne: true },
        });
        return res.status(404).json({ error: true, message: "User not found" });
      } else if (user && user.deleted) {
        console.log("SS");
        return res.status(410).json({
          error: true,
          message:
            "Your Account has been deleted by Admin , Please Contact Customer Care",
        });
      } else if (user && !user.verified) {
        console.log("SSS");
        return res.status(422).json({
          error: true,
          message: "Your Account is not Verified , Verify Your Email First",
        });
      } else if (user && user.deactivate) {
        const activate = await User.findByIdAndUpdate(
          user._id,
          {
            $set: { deactivate: false }
          }, { new: true }
        );
        let adv = await Adv.updateMany(
          { user_id: user._id },
          { $set: { deactivate: false } },
        );
        let tok = jwt.sign({ _id: user._id }, config.secret_key, {
          expiresIn: "30 days", // expires in 24 hours
        });
        return res.status(201).json({ success: true, token: tok, status: "your account has been succesfully reactivated and logged in", data: activate })
      }

      if (!user.authentication(data.password)) {
        return res
          .status(401)
          .json({ error: true, message: "Password incorrect" });
      }
      let token = jwt.sign({ _id: user._id }, config.secret_key, {
        expiresIn: "30 days", // expires in 24 hours
      });
      user.token = data.token;
      user.isLoggedin = true;
      user.save();
      console.log("user_last", user);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      let obj = {
        verified: user.verified,
        deleted: user.deleted,
        deactivate: false,
        _id: user._id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        createdAt: user.createdAt,
        profile_picture: user.profile_picture,
      };
      res.json({
        success: true,
        token: token,
        status: "you are succesfully loged in",
        data: obj,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message,
      error: true,
    });
  }
});

router.post("/logout/:id", async (req, res) => {
  const user_id = req.params;
  console.log(user_id, "USER ID WANTs TO LOGOUT");
  let logout_user = await User.findByIdAndUpdate(
    user_id.id,
    {
      $set: { isLoggedin: false, token: "" },
    },
    { new: true },
  );

  res
    .status(200)
    .json({ user: logout_user, message: "user Logged out successfully" });
});

router.delete("/:id", middlewear.checkToken, async (req, res) => {
  const data = req.params;
  console.log(req.decoded, "CHECKEXPRESS", req.decode);
  // let email = req.decoded._id;
  try {
    console.log("check", data);
    const schema = Joi.object({
      id: Joi.string().required(),
    });

    const value = await schema.validateAsync(data);
    if (!value.error) {
      let adv = await Adv.updateMany(
        { user_id: data.id },
        { $set: { deleted: true } },
      );
      let user = await User.findByIdAndUpdate(
        data.id,
        {
          $set: { deleted: true },
        },
        { new: true },
      );

      res.status(200).json({
        error: true,
        message: "Successfully deleted",
        deletedItems: user,
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

router.post("/forget_password", async (req, res) => {
  let token = crypto.randomBytes(3);
  token = token.toString("hex");
  console.log("t ", token);
  let obj = {
    reset_password_token: token,
    reset_password_expires: Date.now() + 86400000,
  };
  let user = await User.findOneAndUpdate(
    { email: req.body.email },
    {
      $set: obj,
    },
    { new: true },
  );
  
});

router.post("/change_password", async (req, res) => {
  const data = req.body;
  const schema = Joi.object({
    reset_password_token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  });
  try {
    const value = schema.validateAsync(data);
    if (!value.error) {
      let user = await User.findOne({
        reset_password_token: data.reset_password_token,
        reset_password_expires: { $gt: Date.now() },
      });
      user.password = data.password;
      user.reset_password_token = undefined;
      user.reset_password_expires = undefined;
      user.save();
      res.status(200).json({
        error: false,
        message: "Sucessfully updated",
      });
    }
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
});

router.get("/verify/:user_id/:token", async (req, res) => {
  const data = req.params;
  const schema = Joi.object({
    user_id: Joi.string().required(),
    token: Joi.string().required(),
  });
  try {
    const value = schema.validateAsync(data);
    if (!value.error) {
      console.log("start", data);
      let user = await User.findById(data.user_id);
      if ((user.token = data.token)) {
        user.verified = true;
        user.save();
        res.sendFile(path.join(__dirname, "../index.html"));
      } else {
        res.status(400).json("Invalid token");
      }
    }
  } catch (err) {
    console.log("err", err);
    res.status(400).json({ err: err.message });
  }
});

router.post("/deactivate_account/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    console.log("run")
    const schema = Joi.object({
      id: Joi.string().required(),
      reason: Joi.string().required()
    });
    const value = await schema.validateAsync(data);
    if (!value.error) {
      let adv = await Adv.updateMany(
        { user_id: id },
        { $set: { deactivate: true } },
      );
      let user = await User.findByIdAndUpdate(
        id,
        {
          $set: { deactivate: true, deactivate_reason: data.reason },
        },
        { new: true },
      );
      res.status(200).json({
        error: true,
        message: "Successfully deactivated",
        deactivatedItems: user,
      });
    }
  } catch (error) {
    console.log(error, "FAILE")
    res.status(400).json({
      error: true,
      message: error.message,
    });
  }
})

module.exports = router;
