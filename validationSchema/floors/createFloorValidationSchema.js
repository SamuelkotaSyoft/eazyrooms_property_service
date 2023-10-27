import { body } from "express-validator";
import Block from "../../models/blockModel.js";
import Floor from "../../models/floorModel.js";
import Location from "../../models/locationModel.js";
const createFloorValidationSchema = [
  body("location")
    .custom(async (locationId) => {
      const location = await Location.findOne({
        _id: locationId,
        status: true,
      });
      if (!location) {
        throw new Error("location is required and should be a valid ObjectId");
      }
    })
    .notEmpty(),
  body("block")
    .optional({ values: null | undefined | "" })
    .custom(async (blockId) => {
      if (blockId === null || blockId === undefined || blockId === "") {
        return true;
      }
      const location = await Block.findOne({
        _id: blockId,
        status: true,
      });
      if (!location) {
        throw new Error("block is required and should be a valid ObjectId");
      }
    }),
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .custom(async (name, { req }) => {
      const filterObj = {
        block: req.body.block,
        location: req.body.location,
        name: new RegExp("^" + name + "$", "i"),
        status: true,
      };
      console.log({ block: req.body.block });
      if (
        req.body.block === null ||
        req.body.block === undefined ||
        req.body.block === ""
      ) {
        console.log("block is not present");
        // delete filterObj.block;
        filterObj.block = { $exists: false };
      }
      console.log({ filterObj });
      const isFloorExisting = await Floor.findOne(filterObj);
      if (isFloorExisting) {
        throw new Error("Name should be unique in block level");
      }
    }),
];
export { createFloorValidationSchema };
