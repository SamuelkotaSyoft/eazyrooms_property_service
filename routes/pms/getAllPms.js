import express from "express";
import pmsModel from "../../models/pmsModel.js";
import verifyToken from "../../helpers/verifyToken.js";
const router = express.Router();

async function getAllPms(req, res) {
  const role = req.user_info.role;
  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    const pms = await pmsModel.find({ status: true });
    res.status(200).json({ status: true, data: pms });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
router.get("/", verifyToken, getAllPms);
export default router;
