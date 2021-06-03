import mongoose from "mongoose"

const { Schema, model } = mongoose


const blogSchema = new Schema(
    {
        category: {
            type: String,
            required: true,
            minLength: 5,
        },
        title: {
            type: String,
            required: true
        },
        readtime: {
            value: Number,
            unit: String,
        },
        author: {
            name: String,
            avatar: String,
        },
        content: {
            type: String,
            required: true
        },
        comments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: true, }]

    },

    { timestamps: true }
)


/**when blog is deleted you have to delete all comments as well */


blogSchema.static("findBlog", async function (id) {
    const blog = await this.findOne({ _id: id }).populate("comments")
    console.log(blog)
    return blog
})


blogSchema.static("GetComments", async function (id) {
    const comments = await this.findById(id, { comments: 1 }).populate("comments")
    return comments
})




export default new model("Blog", blogSchema)