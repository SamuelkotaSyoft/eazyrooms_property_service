import express from "express";
import propertyModel from "../../models/propertyModel.js";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

const router = express.Router();
const deletePropertyById = async (req, res) => {
  const role = req.user_info.role;

  try {
    if (role !== "propertyAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }
    const property = await propertyModel.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      {
        status: false,
        updatedBy: user._id,
      },
      { new: true }
    );
    if (property.status === false) {
      await updateRelatedModels(
        { property: property._id },
        { status: property.status },
        "property"
      );
    }
    res.status(200).json({ status: true, data: property });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
};
router.delete("/:id", verifyToken, deletePropertyById);
export default router;
