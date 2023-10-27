import express from "express";
import verifyToken from "../../helpers/verifyToken.js";

var router = express.Router();

//import models
import Location from "../../models/locationModel.js";
import User from "../../models/userModel.js";

//get user by id
router.get("/:locationId", verifyToken, async function (req, res) {
  //payload
  const uid = req.user_info.main_uid;
  const locationId = req.params.locationId;

  //validate userId
  if (!uid) {
    return res.status(400).json({ status: false, error: "userId is required" });
  }

  //validate orderId
  if (!locationId) {
    return res
      .status(200)
      .json({ status: false, error: "locationId is required" });
  }

  try {
    //query
    let query = Location.findOne({
      _id: locationId,
    }).populate("property");

    //execute query
    const queryResult = await query.exec();

    //return result
    res.status(200).json({ status: true, data: queryResult });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
});

export default router;
