import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import "./firebase-config.js";

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

/**
 *
 * dotenv config
 */
const __dirname = path.resolve();
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

/**
 *
 * connect to mongodb
 */
await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
console.log("MONGODB CONNECTED...");

/***
 *
 * location routes
 */

app.use(
  "/createLocation",
  (await import("./routes/locations/createLocation.js")).default
);

app.use(
  "/getAllLocations",
  (await import("./routes/locations/getAllLocations.js")).default
);

app.use(
  "/getLocationById",
  (await import("./routes/locations/getLocationById.js")).default
);

app.use(
  "/updateLocationById",
  (await import("./routes/locations/updateLocationById.js")).default
);

app.use(
  "/deleteLocationById",
  (await import("./routes/locations/deleteLocationById.js")).default
);

/**
 *
 * block routes
 */

app.use(
  "/createBlock",
  (await import("./routes/blocks/createBlock.js")).default
);
app.use(
  "/getAllBlocks",
  (await import("./routes/blocks/getAllBlocks.js")).default
);
app.use(
  "/getBlockById",
  (await import("./routes/blocks/getBlockById.js")).default
);
app.use(
  "/updateBlockById",
  (await import("./routes/blocks/updateBlockById.js")).default
);

app.use(
  "/deleteBlockById",
  (await import("./routes/blocks/deleteBlockById.js")).default
);

/**
 *
 * floor routes
 */
app.use(
  "/createFloor",
  (await import("./routes/floors/createFloor.js")).default
);
app.use(
  "/getAllFloors",
  (await import("./routes/floors/getAllFloors.js")).default
);
app.use(
  "/getFloorById",
  (await import("./routes/floors/getFloorById.js")).default
);
app.use(
  "/updateFloorById",
  (await import("./routes/floors/updateFloorById.js")).default
);
app.use(
  "/deleteFloorById",
  (await import("./routes/floors/deleteFloorById.js")).default
);

/**
 *
 * amenity routes
 */
app.use(
  "/createAmenity",
  (await import("./routes/amenities/createAmenity.js")).default
);
app.use(
  "/getAllAmenities",
  (await import("./routes/amenities/getAllAmenities.js")).default
);
app.use(
  "/getAmenityById",
  (await import("./routes/amenities/getAmenityById.js")).default
);
app.use(
  "/updateAmenityById",
  (await import("./routes/amenities/updateAmenityById.js")).default
);
app.use(
  "/deleteAmenityById",
  (await import("./routes/amenities/deleteAmenityById.js")).default
);

/**
 *
 * room type routes
 */
app.use(
  "/createRoomType",
  (await import("./routes/roomTypes/createRoomType.js")).default
);
app.use(
  "/getAllRoomTypes",
  (await import("./routes/roomTypes/getAllRoomTypes.js")).default
);
app.use(
  "/getRoomTypeById",
  (await import("./routes/roomTypes/getRoomTypeById.js")).default
);
app.use(
  "/updateRoomTypeById",
  (await import("./routes/roomTypes/updateRoomTypeById.js")).default
);
app.use(
  "/deleteRoomTypeById",
  (await import("./routes/roomTypes/deleteRoomTypeById.js")).default
);

/**
 *
 *
 *
 * room routes
 */
app.use("/createRoom", (await import("./routes/rooms/createRoom.js")).default);
app.use(
  "/getAllRooms",
  (await import("./routes/rooms/getAllRooms.js")).default
);
app.use(
  "/getRoomById",
  (await import("./routes/rooms/getRoomById.js")).default
);
app.use(
  "/getRoomByRoomType",
  (await import("./routes/rooms/getAllRoomsByRoomType.js")).default
);
app.use(
  "/updateRoomById",
  (await import("./routes/rooms/updateRoomById.js")).default
);
app.use(
  "/deleteRoomById",
  (await import("./routes/rooms/deleteRoomById.js")).default
);

/**
 *
 * property routes
 */
app.use(
  "/createProperty",
  (await import("./routes/properties/createProperty.js")).default
);
app.use(
  "/getAllProperties",
  (await import("./routes/properties/getAllProperties.js")).default
);
app.use(
  "/getPropertyById",
  (await import("./routes/properties/getPropertyById.js")).default
);
app.use(
  "/updatePropertyById",
  (await import("./routes/properties/updatePropertyById.js")).default
);
app.use(
  "/deletePropertyById",
  (await import("./routes/properties/deletePropertyById.js")).default
);

/**
 *
 * pms routes
 */

app.use("/createPms", (await import("./routes/pms/createPms.js")).default);
app.use(
  "/updatePmsById",
  (await import("./routes/pms/updatePmsById.js")).default
);
app.use("/getAllPms", (await import("./routes/pms/getAllPms.js")).default);
app.use("/getPmsById", (await import("./routes/pms/getPmsById.js")).default);

/**load starting content */
app.use(
  "/loadStartingContent",
  (await import("./routes/loadStartingContent.js")).default
);

/**
 *
 * start listening to requests
 */
app.listen(port, () => {
  console.log(`Property service listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", service: "Property Service" });
});
