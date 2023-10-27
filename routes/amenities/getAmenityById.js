import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Amenity from "../../models/amenityModel.js";
import { getAmentiyByIdValidationSchema } from "../../validationSchema/amenities/getAmentiyByIdValidationSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";

//get user by id
router.get(
  "/:amenityId",
  getAmentiyByIdValidationSchema,
  validateRequest,
  verifyToken,
  async function (req, res) {
    //payload
    const uid = req.user_info.main_uid;
    const amenityId = req.params.amenityId;
    const role = req.user_info.role;

    //validate userId

    try {
      if (role !== "propertyAdmin" && role !== "locationAdmin") {
        res.status(403).json({ status: false, error: "Unauthorized" });
        return;
      }
      //query
      let query = Amenity.findOne({ _id: amenityId, status: true });

      //execute query
      const queryResult = await query.exec();

      //return result
      res.status(200).json({ status: true, data: queryResult });
    } catch (err) {
      res.status(500).json({ status: false, error: err });
    }
  }
);

export default router;
