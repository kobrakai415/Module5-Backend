import { body } from "express-validator"

export const postValidation = [
  body("title").exists().withMessage("title is a mandatory field!"),
  body("category").exists().withMessage("category is a mandatory field!"),
  body("content").exists().withMessage("Blog text is a mandatory field!"),
]