import express from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
import Property from "../../models/propertyModel.js";
import { updatePropertyValidationSchema } from "../../validationSchema/properties/updatePropertyValidationSchema.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";
const router = express.Router();
const updatePropertyById = async (req, res) => {
  const requestData = matchedData(req);
  //TODO change this and work on pms model
  const id = requestData.propertyId;
  const role = req.user_info.role;
  try {
    if (role !== "propertyAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    const property = await Property.findByIdAndUpdate(
      { _id: id },
      { ...requestData },
      { new: true }
    );
    if (property.status === false || property.active) {
      await updateRelatedModels(
        { property: property._id },
        { status: property.status, active: property.active },
        "property"
      );
    }
    res.status(200).json({ status: true, data: property });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ status: false, error: err });
  }
};

router.patch(
  "/",
  verifyToken,
  updatePropertyValidationSchema,
  updatePropertyById
);
export default router;
