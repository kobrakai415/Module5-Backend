import mongoose from "mongoose"
import createError from "http-errors"

const { Schema, model } = mongoose

const AuthorsSchema = new Schema(
    {

        name: { type: String, required: true },
        surname: { type: String, required: true },
        email: { type: String, required: true },
        dob: { type: Date, required: true },
        avatar: { type: String,}
    },
    { timestamps: true }

)

AuthorsSchema.post("validate", (error, doc, next) => {
    if (error) {
        const err = createError(400, error)
        next(err)
    } else {
        next()
    }
})

export default new model("Author", AuthorsSchema)