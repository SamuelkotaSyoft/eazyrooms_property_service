import locationModel from "../../models/locationModel.js";
import roomTypeModel from "../../models/roomTypeModel.js";
import { query } from "express-validator";
const getRooomByRoomTypeValidationSchema = [
  query("roomType").custom(async (roomTypeId) => {
    const isValidRoomTypeId = await roomTypeModel.findOne({
      _id: roomTypeId,
      status: true,
      active: true,
    });
    if (!isValidRoomTypeId) {
      throw new Error("Invalid room type id and should be active");
    }
  }),
  query("location").custom(async (locationId) => {
    const isValidLocationId = await locationModel.findOne({
      _id: locationId,
      status: true,
    });
    if (!isValidLocationId) {
      throw new Error("Invalid location id and should be active");
    }
  }),
];
export { getRooomByRoomTypeValidationSchema };
