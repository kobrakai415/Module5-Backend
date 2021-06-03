import mongoose from "mongoose"
import createError from "http-errors"

const { Schema, model } = mongoose

const CommentsSchema = new Schema(
    {   
        blogID: {type: Schema.Types.ObjectId },
        rate: {type: Number, min: 0, max: 5, required: true},
        comment: {type: String, required: true}
    },
    {timestamps: true}

)


/**
 * 
 * when comment is deleted pull it from array on blog
 */
 CommentsSchema.static("DeleteComment", async function (id) {
    const deletedComment = await this.findByIdAndDelete(id)
    return deletedComment
})

CommentsSchema.post("validate", (error, doc, next) => {
    if (error) {
        const err = createError(400, error)
        next(err)
    } else {
        next()
    }
})


export default new model("Comment", CommentsSchema)