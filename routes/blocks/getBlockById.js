import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Block from "../../models/blockModel.js";
import User from "../../models/userModel.js";

//get user by id
router.get("/:blockId", verifyToken, async function (req, res) {
  //payload
  const uid = req.user_info.main_uid;
  const blockId = req.params.blockId;
  const role = req.user_info.role;

  if (!blockId) {
    return res
      .status(400)
      .json({ status: false, error: "blockId is required" });
  }

  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //validate user
    const user = await User.findOne({ uid: uid });
    console.log(user._id);

    //query
    let query = Block.findOne({
      _id: blockId,
      status: true,
    })
      .populate("location")
      .populate("property");
    //execute query
    const queryResult = await query.exec();

    //return result
    res.status(200).json({ status: true, data: queryResult });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
});

export default router;
