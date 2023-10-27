import express from "express";
import { generateQrcode } from "../helpers/generateQrcode.js";
import Amenity from "../models/amenityModel.js";
import Product from "../models/productModel.js";
import RoomType from "../models/roomTypeModel.js";
import StoreCategory from "../models/storeCategoryModel.js";
import Store from "../models/storeModel.js";
import User from "../models/userModel.js";
import { startingContent } from "./startingContent.js";
import productTagModel from "../models/productTagModel.js";
const router = express.Router();

export default async function loadStartingContent({ uid, locationId }) {
  try {
    //fetch user by uid
    const user = await User.findOne({ uid: uid });
    /**
     *
     * load amenities
     */

    const amenitiesResult = await Amenity.insertMany(
      startingContent.amenities.map((amenity) => ({
        ...amenity,
        location: locationId,
        property: user.property,
        active: false,
        status: true,
        updatedBy: user._id,
        createdBy: user._id,
      }))
    );

    /**load room types */
    function shuffleArray(array) {
      if (array?.length === 0) {
        return [];
      }
      for (let i = array?.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    const roomTypesResult = await RoomType.insertMany(
      startingContent.roomTypes.map((roomType) => ({
        ...roomType,
        location: locationId,
        property: user.property,
        active: false,
        status: true,
        updatedBy: user._id,
        createdBy: user._id,
        amenities: shuffleArray(amenitiesResult)?.slice(0, 5),
      }))
    );

    /**load stores */
    const storesResult = await Store.insertMany(
      startingContent.stores.map((store) => ({
        ...store,
        location: locationId,
        property: user.property,
        active: false,
        status: true,
        updatedBy: user._id,
        createdBy: user._id,
        qrCode: "asdf",
      }))
    );

    let updateStoresResult = [];
    for (let i = 0; i < storesResult.length; i++) {
      const qrCodeResult = await generateQrcode(
        `${process.env.GUEST_APP_URL}/products/${storesResult[i]._id}?storeName=${storesResult[i].name}&type=store&location=${storesResult[i].location}`
      );
      let result = await Store.findByIdAndUpdate(
        storesResult[i]._id,
        {
          qrCode: qrCodeResult,
        },
        { new: true }
      );
      updateStoresResult.push(result);
      for (let j = 0; j < startingContent.tags.length; j++) {
        const data = new productTagModel({
          name: startingContent.tags[j],
          store: storesResult[i]._id,
          createdBy: user._id,
          updatedBy: user._id,
          status: true,
        });
        const wrie = await data.save();
        console.log({ wrie });
      }
    }

    /**load store categories */
    const storeCategoriesResult = await StoreCategory.insertMany(
      startingContent.storeCategories.map((storeCategory) => ({
        ...storeCategory,
        location: locationId,
        property: user.property,
        createdBy: user._id,
        updatedBy: user._id,
        active: false,
        status: true,
        store: updateStoresResult.find(
          (store) => store.name === storeCategory.store
        )._id,
      }))
    );

    //products result
    const productsResult = await Product.insertMany(
      startingContent.products.map((product) => ({
        ...product,
        initialPrice: parseFloat(product.initialPrice),
        finalPrice: parseFloat(product.finalPrice),
        location: locationId,
        property: user.property,
        createdBy: user._id,
        updatedBy: user._id,
        stock: 10,
        active: false,
        status: true,
        store: updateStoresResult.find((store) => store.name === product.store)
          ._id,
        storeCategory:
          storeCategoriesResult.find(
            (storeCategory) => storeCategory.name === product.storeCategory
          )?._id !== undefined
            ? [
                storeCategoriesResult.find(
                  (storeCategory) =>
                    storeCategory.name === product.storeCategory
                )?._id,
              ]
            : null,
      }))
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
