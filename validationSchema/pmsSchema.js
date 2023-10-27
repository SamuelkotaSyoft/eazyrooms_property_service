import { body } from "express-validator";
const createPmsValidationSchema = [
  body("name").ltrim().rtrim().notEmpty().withMessage("Name is required"),
];
const updatePmsValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .optional()
    .notEmpty()
    .withMessage("Name is required"),
];
export { createPmsValidationSchema, updatePmsValidationSchema };
