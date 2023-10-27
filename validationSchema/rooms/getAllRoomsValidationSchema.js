import { body, query } from "express-validator";
import roomTypeModel from "../../models/roomTypeModel.js";
import floorModel from "../../models/floorModel.js";

const getAllRoomValidationSchema = [
  query("roomType")
    .optional({ values: "falsy" })
    .custom(async (value, { req }) => {
      if (value !== "" || value !== null || value !== undefined) {
        console.log({ value });
        const isValidRoomType = await roomTypeModel.findOne({
          _id: value,
          status: true,
        });
        if (!isValidRoomType) {
          throw new Error("Room Type is not valid");
        }
      }
    }),
  query("floorId")
    .optional({ values: "falsy" })
    .custom(async (value, { req }) => {
      console.log({ value });
      if (value !== "" || value !== null || value !== undefined) {
        const isValidFloor = await floorModel.findOne({
          _id: value,
          status: true,
        });
        if (!isValidFloor) {
          throw new Error("Floor is not valid");
        }
      }
    }),
];

export { getAllRoomValidationSchema };
