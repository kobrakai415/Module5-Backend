import atob from "atob"
import createError from "http-errors"
import {verifyToken} from "./JWT.js"
import AuthorModel from "../authors/authorsSchema.js"

const basicAuthMiddleWare = async (req, res, next) => {

    if (!req.headers.authorization) {
        next(createError(401, "Please provide authorization header!"))
    } else {
        const decoded = atob(req.headers.authorization.split(" ")[1])

        console.log(decoded)

        const [email, password] = decoded.split(":")

        console.log(email)
        console.log(password)

        const user = await AuthorModel.checkCredentials(email, password)

        if (user) {
            req.user = user
            next()
        } else {
            next(createError(401, "Credentials are incorrect!"))
        }

    }

}

export const JWTAuthMiddleware = async (req, res, next) => {
    if (!req.headers.authorization) next(createError(401, "Authorization not provided"))
    else {
        try {
            const token = req.headers.authorization.replace("Bearer ", "")
            const content = await verifyToken(token)
         
            
            const user = await AuthorModel.findById(content._id)

            if (user) {
                req.user = user
                next()
            } else next(createError(404, "User not found"))
        } catch (error) {
            next(createError(401, "Token not valid"))
        }
    }
}

export default basicAuthMiddleWare