import mongoose from "mongoose"

const { Schema, model } = mongoose


const blogSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    readtime: {
        value: Number,
        unit: String
    },
    author:{
        name: String,
        avatar: String,
    },
    content: String,
    createdOn: Date,
    updatedOn: Date
})

export default new model("Blog", blogSchema)