import express from "express";
import { matchedData } from "express-validator";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import verifyToken from "../../helpers/verifyToken.js";
import Pms from "../../models/pmsModel.js";
import Property from "../../models/propertyModel.js";
import User from "../../models/userModel.js";
import { createPropertyValidationSchema } from "../../validationSchema/properties/createPropertyValidationSchema.js";
import { uploadImageToS3 } from "../../helpers/uploads/uploadSingleImage.js";
const router = express.Router();

//create property controllers

const createProperty = async (req, res) => {
  try {
    const matchedReq = matchedData(req);
    //creating a uuid for identification

    //request payload data
    const uid = req.user_info.main_uid;
    const userRole = req.user_info.role;
    const name = matchedReq.name;
    const pmsId = matchedReq.pms;

    //validate role
    if (userRole !== "propertyAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }

    //validate user
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid user" });
      return;
    }

    if (user.property) {
      res.status(400).json({
        status: false,
        error: [{ msg: "User already has a property" }],
      });
      return;
    }

    //validate pms
    // const pms = await Pms.findOne({ _id: pmsId, status: true });
    // if (!pms) {
    //   res.status(400).json({ status: false, error: "Invalid pmsId" });
    //   return;
    // }
    const property = new Property({
      name,
      pms: matchedReq.pms,
      image: req.fileUrl,
      propertyAdmin: user._id,
      status: true,
      createdBy: user._id,
      updatedBy: user._id,
    });

    const savePropertyResult = await property.save();

    //update user
    const updateUserResult = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          property: savePropertyResult._id,
        },
      },
      { new: true }
    );

    res.status(200).json({ status: true, data: savePropertyResult });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ error: err });
  }
};

router.post(
  "/",
  verifyToken,
  uploadImageToS3,
  createPropertyValidationSchema,
  validateRequest,
  createProperty
);

export default router;
