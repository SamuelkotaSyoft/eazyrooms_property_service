import express from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();
//import models
import notify from "../../helpers/notifications/notify.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Location from "../../models/locationModel.js";
import Property from "../../models/propertyModel.js";
import User from "../../models/userModel.js";
import { createLocationValidationSchema } from "../../validationSchema/locations/createLocationValidationSchema.js";
import loadStartingContent from "../loadStartingContent.js";

//create chatbot
async function createLocation(req, res) {
  //request payload

  const requestData = matchedData(req);
  if (requestData.website === "") {
    delete requestData.website;
  }
  const uid = req.user_info.main_uid;
  const role = req.user_info.role;
  const name = requestData.name;
  const locationType = requestData.locationType;
  const roomCount = requestData.roomCount;
  const website = requestData.website;
  const address = requestData.address;
  //validate userId

  try {
    console.log(req.fileUrls);

    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }

    //validate user
    const user = await User.findOne({ uid: uid });

    if (!user) {
      res.status(400).json({
        status: false,
        error: [{ msg: "Invalid userId" }],
      });
      return;
    }

    //validate location

    //validate property
    const property = await Property.findOne({
      _id: user.property,
      status: true,
    });

    if (!property) {
      res.status(400).json({ error: [{ msg: "Property must be valid" }] });
      return;
    }

    //add address
    const location = new Location({
      name: name,
      images: req.fileUrls,
      address: address,
      property: property._id,
      locationType: locationType,
      locationAdmin: user._id,
      roomCount: roomCount,
      website: website,
      createdBy: user._id,
      updatedBy: user._id,
      status: true,
      ...requestData,
    });

    //save address
    const writeResult = await location.save();

    //load demo data
    await new Promise(async (resolve, reject) => {
      let result = await loadStartingContent({
        uid: uid,
        locationId: writeResult._id,
      });
      if (result) {
        resolve(true);
      }
      reject(false);
    });

  try{
    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writeResult._id],
      role: ["locationAdmin"],
      notificationText:
        user.fullName + " has created a new location named " + writeResult.name,
      authToken: req.headers["eazyrooms-token"],
    }).then(()=>{}).catch(err=>{
      console.log(err);
    })

  }
  catch(err){
    console.log(err);
  }
    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
}
router.post(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  createLocationValidationSchema,
  validateRequest,
  createLocation
);

export default router;
