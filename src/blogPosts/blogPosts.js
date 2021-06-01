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
import { sendEmail } from "../helpers/email.js"
import blogModel from "../helpers/schema.js"
import { create } from "domain"

const { readJSON, writeJSON, writeFile, createReadStream } = fs

const router = express.Router()

const imagesPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/images/blogCovers")

router.get("/", async (req, res, next) => {
    // try {
    //     const blogs = await getBlogPosts()
    //     if (req.query.title) {
    //         const filteredBlogs = blogs.filter(post => post.title.toLowerCase().includes(req.query.title.toLowerCase()))

    //         filteredBlogs.length > 0 ? res.status(200).send(filteredBlogs) : next(createError(404, `No Blogs with title: ${req.query.title}`))
    //     } else {
    //         blogs.length > 0 ? res.send(blogs) : next(createError(404, "No blogs available!"))
    //     }
    // }
    // catch (error) {
    //     next(error)
    // }

    try {
        const blogs = await blogModel.find()

        blogs.length > 0 ? res.send(blogs) : next(createError(404, "No blogs available"))
        
    } catch (error) {
        next(error)
        
    }
})

router.get("/sendEmail", async (req, res, next) => {
    try {
        
        const [response, ...rest] = await sendEmail("kaiwan.kadir@outlook.com")
        console.log(response)
        response.statusCode === 202 ? res.send("Email successfully sent!") : next(error)
      
    } catch (error) {
        next(error)
    }
})

router.get("/:id", async (req, res, next) => {
    // try {
    //     const blogs = await getBlogPosts()
    //     const post = blogs.find(post => post._id === req.params.id)
    //     post ? res.status(200).send(post) : next(createError(404, "Blog post not found, check your ID and try again!"))
    // } catch (error) {
    //     next(error)
    // }
    try {
        const blog = await blogModel.findById(req.params.id)

        blog ? res.send(blog) : next(createError(404, "No blog with such ID, check and try again!"))
        
    } catch (error) {
        next(error)
    }
})

router.post("/", async (req, res, next) => {
    // try {
    //     const blogs = await getBlogPosts()
    //     const errors = validationResult(req)

    //     if (errors.isEmpty()) {
    //         const post = { ...req.body, _id: uniqid(), createdOn: new Date() }
    //         blogs.push(post)
    //         await writeBlogs(blogs)

    //         // await sendEmail(email)

    //         res.status(201).send(post)
    //     } else {
    //         next(createError(400, errors))
    //     }
    // } catch (error) {
    //     next(error)
    // }

    try {
        const blog = new blogModel({...req.body, createdOn: new Date()})
        const resp = await blog.save()
        res.send(resp) 
        
    } catch (error) {
        next(createError(500, "Error whilst retrieving student"))
    }
})

router.put("/:id", async (req, res, next) => {
    // try {
    //     const blogs = getBlogPosts()
    //     const errors = validationResult(req)

    //     if (errors.isEmpty()) {
    //         const post = blogs.find((post) => post._id === req.params.id)
    //         const filtered = blogs.filter(post => post._id !== req.params.id)
    //         const updatedPost = { ...req.body, createdOn: post.createdOn, _id: post._id, lastUpdatedOn: new Date() }
    //         filtered.push(updatedPost)
    //         await writeBlogs(filtered)
    //         res.status(200).send(post)
    //     } else {
    //         next(createError(400, errors))
    //     }
    // } catch (error) {
    //     next(error)
    // }

    try {
        const updatedBlog = await blogModel.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true,}) 

        updatedBlog ? res.send(updatedBlog) : next(createError(404, `Student with id ${req.params.id} not found`))
    } catch (error) {
        next(createError(500, "Error updating student!"))
    }
})

router.delete("/:id", async (req, res, next) => {
    // try {
    //     const blogs = getBlogPosts()
    //     const newPostsArray = blogs.filter(post => post._id !== req.params.id)
    //     await writeBlogs(newPostsArray)

    //     res.send(newPostsArray)
    // } catch (error) {
    //     next(error)
    // }

    try {
        const deleted = await blogModel.findByIdAndDelete(req.params.id)
        
        deleted ? res.send(`Successfuly deleted blog ${req.params.id}`) : next(createError(500, `Blog with id ${req.params.id} not found`))
        
    } catch (error) {
        next(createError(500, "Error whilst deleting blog!"))
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

router.get("/:id/comments", async (req, res, next) => {

})

router.post("/:id/comments", async (req, res, next) => {

})

export default router
