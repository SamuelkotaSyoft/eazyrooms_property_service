import Floor from "../../models/floorModel.js";
import Room from "../../models/roomModel.js";
import Store from "../../models/storeModel.js";
import Block from "../../models/blockModel.js";
import RoomType from "../../models/roomTypeModel.js";
import Location from "../../models/locationModel.js";
import Amenity from "../../models/amenityModel.js";
function updateRelatedModels(matchingData, updatingContent, parentModel) {
  let updatingObj = {
    status: updatingContent.status,
    active: updatingContent.active,
  };
  /**
   * if true ignore because it will update all the inactive models as well of dependent models
   */
  if (updatingObj?.status) {
    delete updatingObj?.status;
  }
  /**
   * if true ignore because it will update all the inactive models as well of dependent models
   */
  if (updatingObj?.active) {
    delete updatingObj?.active;
  }
  /**
   * checks with the parent model and updates the related models
   * we don't need the if conditions over here since the filter will take care of it
   * ie the lower levels will only always match the filter and update the models
   * for the sake of understanding i have added the if conditions
   */
  return new Promise(async (resolve, reject) => {
    try {
      if (parentModel === "property") {
        await Floor.updateMany(matchingData, updatingContent);
        await Room.updateMany(matchingData, updatingContent);
        await Store.updateMany(matchingData, updatingContent);
        await Block.updateMany(matchingData, updatingContent);
        await RoomType.updateMany(matchingData, updatingContent);
        await Location.updateMany(matchingData, updatingContent);
        await Amenity.updateMany(matchingData, updatingContent);
        //await
        RoomType.updateMany(matchingData, updatingContent);
      } else if (parentModel === "location") {
        await Floor.updateMany(matchingData, updatingContent);
        await Room.updateMany(matchingData, updatingContent);
        await Store.updateMany(matchingData, updatingContent);
        await Block.updateMany(matchingData, updatingContent);
        await RoomType.updateMany(matchingData, updatingContent);
        await Amenity.updateMany(matchingData, updatingContent);

        //await
        RoomType.updateMany(matchingData, updatingContent);
      } else if (parentModel === "block") {
        await Floor.updateMany(matchingData, updatingContent);
        await Room.updateMany(matchingData, updatingContent);
        await RoomType.updateMany(matchingData, updatingContent);
      } else if (parentModel === "floor") {
        await Room.updateMany(matchingData, updatingContent);
        await RoomType.updateMany(matchingData, updatingContent);
      } else if (parentModel === "roomType") {
        await Room.updateMany(matchingData, updatingContent);
      }
      //this is for room
      else {
        await RoomType.updateMany(matchingData, updatingContent);
      }

      resolve({ status: true });
    } catch (err) {
      reject({ status: false, error: `Error updating ${updatingContent}` });
    }
  });
}
export default updateRelatedModels;
