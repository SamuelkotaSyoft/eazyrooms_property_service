import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Room from "../../models/roomModel.js";

//get user by id
router.get("/:roomId", async function (req, res) {
  //payload
  // const uid = req.user_info.main_uid;
  const roomId = req.params.roomId;

  const role = req?.user_info?.role;

  //validate userId
  // if (!uid) {
  //   return res.status(400).json({ status: false, error: "userId is required" });
  // }

  //validate orderId
  if (!roomId) {
    return res.status(400).json({ status: false, error: "roomId is required" });
  }

  try {
    // if (role !== "propertyAdmin" && role !== "locationAdmin") {
    //   res.status(403).json({ status: false, error: "Unauthorized" });
    //   return;
    // }
    //query
    let query = Room.findOne({ _id: roomId });

    //execute query
    const queryResult = await query.exec();

    //return result
    res.status(200).json({ status: true, data: queryResult });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
});

export default router;
