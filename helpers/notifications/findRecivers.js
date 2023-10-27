import mongoose from "mongoose";
import User from "../../models/userModel.js";

async function findRecivers({
  propertyId,
  userId,
  role = ["locationAdmin"],
  location = {},
}) {
  //   console.log(locationId);
  //TODO fix this first and start off anything else
  //   if (typeof locationId === "string") {
  //     notifyUsersList = await User.find({
  //       location: locationId,
  //       _id: { $ne: new mongoose.Types.ObjectId(userId) },
  //       role: { $in: ["locationAdmin", "propertyAdmin"] },
  //     });
  //   } else {
  const propertyAdmins = await User.find({
    property: propertyId,
    _id: { $ne: new mongoose.Types.ObjectId(userId) },
    role: "propertyAdmin",
  });

  const notifyUsersList = await User.find({
    property: propertyId,
    _id: { $ne: new mongoose.Types.ObjectId(userId) },
    role: { $in: [...role] },
    ...location,
  });
  //   }

  return notifyUsersList;
}

export default findRecivers;

// {location:{$in:[ObjectId('645a0dae13dcef75130d919e')]},property:{$in:[ObjectId('645b21e0b43b6d31753d7027')]}}
//property 645b21e0b43b6d31753d7027
//location 645a0dae13dcef75130d919e
