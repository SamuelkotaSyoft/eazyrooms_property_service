import { body } from "express-validator";

const imageValidationSchema = [
  body("id").custom(async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("id should be a valid ObjectId");
    }
  }),
];

export { imageValidationSchema };
