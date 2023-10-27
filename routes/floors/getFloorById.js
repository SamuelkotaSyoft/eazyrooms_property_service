import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Floor from "../../models/floorModel.js";
import userModel from "../../models/userModel.js";

//get user by id
router.get("/:floorId", verifyToken, async function (req, res) {
  //payload
  const uid = req.user_info.main_uid;
  const floorId = req.params.floorId;
  const role = req.user_info.role;

  //validate userId
  const user = await userModel.findOne({ uid: uid });
  if (!user) {
    res.status(400).json({ error: [{ msg: "invalid UserId" }] });
  }

  //validate orderId
  if (!floorId) {
    return res
      .status(200)
      .json({ status: false, error: "floorId is required" });
  }

  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //query
    let query = Floor.findOne({ _id: floorId, status: true })
      .populate("property")
      .populate("block")
      .populate("location");

    //execute query
    const queryResult = await query.exec();

    //return result
    res.status(200).json({ status: true, data: queryResult });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
});

export default router;
