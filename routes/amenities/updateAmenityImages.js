import express from "express";
import { matchedData } from "express-validator";
import amenityModel from "../../models/amenityModel.js";
import { imageValidationSchema } from "../../validationSchema/imageValidationSchema.js";
const router = express.Router();
const updateImage = async (req, res) => {
  const requestData = matchedData(req);
  const amenity = await amenityModel.updateOne(
    { _id: requestData?.id },
    { $unset: { [`myArray.${requestData?.imageIndex}`]: 1 } },
    { new: true }
  );
  res.status(200).json({ status: true, data: amenity });
};
export default router.patch("/updateImage", imageValidationSchema, updateImage);
