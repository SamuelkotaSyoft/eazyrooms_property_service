import { body, param } from "express-validator";
import floorModel from "../../models/floorModel.js";
import mongoose from "mongoose";
const updateFloorValidationSchema = [
  body("floorId").notEmpty().withMessage("FloorId is required"),
  body("name")
    .ltrim()
    .rtrim()
    .optional()
    .notEmpty()
    .withMessage("Name is required")
    .custom(async (name, { req }) => {
      const associatedLocation = await floorModel.findOne({
        _id: new mongoose.Types.ObjectId(req.body.floorId),
      });
      let filterObj = {
        _id: { $ne: new mongoose.Types.ObjectId(req.body.floorId) },
        name: new RegExp("^" + name + "$", "i"),
        location: associatedLocation.location,
        block: req.body.block,
        status: true,
      };
      if (
        req.body.block === null ||
        req.body.block === undefined ||
        req.body.block === ""
      ) {
        console.log("block is not present");
        // delete filterObj.block;
        filterObj.block = { $exists: false };
      }
      const isFloorExisting = await floorModel.findOne(filterObj);
      if (isFloorExisting) {
        throw new Error("Floor Already Exists in this block");
      }
    }),
  body("block").optional({ values: null | undefined | "" }),
  body("status").optional().isBoolean().withMessage("Status must be boolean"),
  body("active").optional().isBoolean().withMessage("Active must be boolean"),
];

export { updateFloorValidationSchema };
