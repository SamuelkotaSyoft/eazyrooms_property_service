import express from "express";
const router = express.Router();
import propertyModel from "../../models/propertyModel.js";
import verifyToken from "../../helpers/verifyToken.js";

const getPropertyById = async (req, res) => {
  const role = req.user_info.role;
  const propertyId = req.params.id;
  try {
    if (role !== "propertyAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    const property = await propertyModel.find({ _id: propertyId });
    res.status(200).json({ status: true, data: property });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
};

router.get("/:id", verifyToken, getPropertyById);

export default router;
