import mongoose from "mongoose"
import createError from "http-errors"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const AuthorsSchema = new Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        dob: { type: Date, required: true },
        avatar: { type: String, },
        password: { type: String, required: true },
        role: {type: String, required: true, immutable: true},
        refreshToken: {type: String, default: ""}
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


AuthorsSchema.pre("save", async function (next) {
    const newAuthor = this

    const plainPw = newAuthor.password

    if (newAuthor.isModified("password")) {
        newAuthor.password = await bcrypt.hash(plainPw, 10)
    }
    next()
})

AuthorsSchema.methods.toJSON = function () {

    const author = this

    const authorObject = author.toObject()

    delete authorObject.password

    delete authorObject.__v
    delete authorObject.refreshToken
    
    delete authorObject.email
 

    return authorObject
}

AuthorsSchema.statics.checkCredentials = async function (email, plainPw) {

    const author = await this.findOne({ email })

    if (author) {

        const hashedPw = author.password

        const isMatch = await bcrypt.compare(plainPw, hashedPw)

        if (isMatch) return author
        else return null

    } else {
        return null
    }
}

export default new model("Author", AuthorsSchema)