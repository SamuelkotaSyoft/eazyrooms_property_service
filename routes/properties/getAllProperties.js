import express from "express";
import propertyModel from "../../models/propertyModel.js";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";

const router = express.Router();

const getAllProperties = async function (req, res) {
  const requestData = matchedData(req);
  var skip = 0;
  var limit = null;
  let status = true;
  const role = req.user_info.role;
  if (requestData.status) {
    status = requestData.status;
  }
  if (requestData.page && requestData.limit) {
    skip = (requestData.page - 1) * requestData.limit;
    limit = requestData.limit;
  }
  try {
    if (role !== "propertyAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    const properties = await propertyModel
      .find({ status })
      .skip(skip)
      .limit(limit);
    const findDocumentsCount = await propertyModel.find({ status });
    const propertyCount = await propertyModel.countDocuments(
      findDocumentsCount
    );

    res.status(200).json({
      status: true,
      data: {
        properties,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(propertyCount / limit),
        totalCount: propertyCount,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
};
router.get(
  "/",
  verifyToken,
  commonGetRequestValidationSchema,
  validateRequest,
  getAllProperties
);

export default router;
