import express from "express"
// import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join, extname } from "path"
import uniqid from "uniqid"
import createError from "http-errors"
import { postValidation } from "./validation.js"
import { validationResult } from "express-validator"
import multer from "multer"
import fs from "fs-extra"
import { getBlogPosts, writeBlogs, writeBlogCovers } from "../helpers/files.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { generatePDFStream } from "../helpers/pdf.js"
import { pipeline } from "stream"

const { readJSON, writeJSON, writeFile, createReadStream } = fs

const router = express.Router()

const imagesPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/images/blogCovers")

router.get("/", async (req, res, next) => {
    try {
        const blogs = await getBlogPosts()
        if (req.query.title) {
            const filteredBlogs = blogs.filter(post => post.title.toLowerCase().includes(req.query.title.toLowerCase()))

            filteredBlogs.length > 0 ? res.status(200).send(filteredBlogs) : next(createError(404, `No Blogs with title: ${req.query.title}`))
        } else {
            blogs.length > 0 ? res.send(blogs) : next(createError(404, "No blogs available!"))
        }
    }
    catch (error) {
        next(error)
    }
})

router.get("/:id", async (req, res) => {
    try {
        const blogs = await getBlogPosts()
        const post = blogs.find(post => post._id === req.params.id)
        post ? res.status(200).send(post) : next(createError(404, "Blog post not found, check your ID and try again!"))
    } catch (error) {
        next(error)
    }
})

router.post("/", postValidation, async (req, res, next) => {
    try {
        const blogs = await getBlogPosts()
        const errors = validationResult(req)

        if (errors.isEmpty()) {
            const post = { ...req.body, _id: uniqid(), createdOn: new Date() }
            blogs.push(post)
            await writeBlogs(blogs)
            res.status(201).send(post)
        } else {
            next(createError(400, errors))
        }
    } catch (error) {
        next(error)
    }
})

router.put("/:id", postValidation, async (req, res, next) => {
    try {
        const blogs = getBlogPosts()
        const errors = validationResult(req)

        if (errors.isEmpty()) {
            const post = blogs.find((post) => post._id === req.params.id)
            const filtered = blogs.filter(post => post._id !== req.params.id)
            const updatedPost = { ...req.body, createdOn: post.createdOn, _id: post._id, lastUpdatedOn: new Date() }
            filtered.push(updatedPost)
            await writeBlogs(filtered)
            res.status(200).send(post)
        } else {
            next(createError(400, errors))
        }
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const blogs = getBlogPosts()
        const newPostsArray = blogs.filter(post => post._id !== req.params.id)
        await writeBlogs(newPostsArray)

        res.send(newPostsArray)
    } catch (error) {
        next(error)
    }

})

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "blogCovers",
        resource_type: "auto"
    }
})

const upload = multer({
    storage: cloudinaryStorage,
    
}).single("blogCover")

router.post("/:id/uploadCover", upload, async (req, res, next) => {
    try {
        console.log(req.file)
        const blogs = await getBlogPosts()

        let blog = blogs.find(blog => blog._id === req.params.id)
        if (!blog) { next(createError(400, "id does not match")) }

        blog.cover = req.file.path

        const newBlogs = blogs.filter(blog => blog._id !== req.params.id)
        newBlogs.push(blog)
        await writeBlogs(newBlogs)

        res.status(200).send("Image uploaded successfully")

    } catch (error) {
        next(error)
    }
})

router.get("/downloadPDF/:id", async (req, res, next) => {
    try {
    const data = await getBlogPosts()
    const blogContent = data.find(blog => blog._id === req.params.id.toString())

    if(blogContent) {
        const source = await generatePDFStream(blogContent)
        
        res.setHeader('Content-Disposition', 'attachment; filename="Example.pdf"')
      
        pipeline(source, res, error => next(error))

    } else {
        next(createError(404, "Blog not found"))
    }
        
    } catch (error) {
        next(error)
    }
})

router.get("/blogposts/:id/comments", async (req, res, next) => {

})

router.post("/blogposts/:id/comments", async (req, res, next) => {

})

export default router
