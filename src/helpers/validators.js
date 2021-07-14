  
import { body } from "express-validator"

export const LoginValidator = [
    body("email").exists().withMessage("Email is a mandatory field").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("password").exists().withMessage("Password is a mandatory field")
]

