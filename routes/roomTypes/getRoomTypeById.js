import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import RoomType from "../../models/roomTypeModel.js";

//get user by id
router.get("/:roomTypeId", verifyToken, async function (req, res) {
  //payload
  const uid = req.user_info.main_uid;
  const roomTypeId = req.params.roomTypeId;

  const role = req.user_info.role;

  //validate userId
  if (!uid) {
    return res.status(400).json({ status: false, error: "userId is required" });
  }

  //validate orderId
  if (!roomTypeId) {
    return res
      .status(200)
      .json({ status: false, error: "roomTypeId is required" });
  }

  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //query
    let query = RoomType.findOne({ _id: roomTypeId }).populate({
      path: "location",
      select: ["currency"],
    });

    //execute query
    const queryResult = await query.exec();

    //return result
    res.status(200).json({ status: true, data: queryResult });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
});

export default router;
