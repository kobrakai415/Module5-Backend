import express from "express"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import createError from "http-errors"
import { postValidation } from "./validation.js"
import { validationResult } from "express-validator"

const router = express.Router()

const blogPostsFile = join(dirname(fileURLToPath(import.meta.url)), "posts.json")
const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsFile).toString())
const writeFile = (content) => fs.writeFileSync(blogPostsFile, JSON.stringify(content))


router.get("/", (req, res) => {
    try {
        if (req.query.title) {
            console.log(req.query.title)
            const filteredBlogs = blogPostsArray.filter(post => post.title === req.query.title)
            const post = blogPostsArray[0]
            console.log(post.title === req.query.title);
            
            console.console.log("blogs", filteredBlogs);
            filteredBlogs.length > 0 ? res.status(200).send(filteredBlogs) : next(createError(404, `No Blogs with ${req.query.title}`))
        } else {
            blogPostsArray.length > 0 ? res.send(blogPostsArray) : next(createError(404, "No blogs available!"))
        }

    } 
    catch (error) {
        next(error)
    }
})

router.get("/:id", (req, res) => {
    try {
        const post = blogPostsArray.find(post => post._id === req.params.id)
        post ? res.status(200).send(post) : next(createError(404, "Blog post not found, check your ID and try again!"))
    } catch (error) {
        next(error)
    }
})

router.post("/", postValidation, (req, res, next) => {

    try {
        const errors = validationResult(req)

        if (errors.isEmpty()) {
            const post = { ...req.body, _id: uniqid(), createdOn: new Date() }
            blogPostsArray.push(post)
            writeFile(blogPostsArray)
                res.status(201).send(post)
        } else {
            next(createError(400, errors ))
        }
    } catch (error) {
        next(error)
    }
})

router.put("/:id", postValidation, (req, res, next) => {
    try {
        const errors = validationResult(req)

        if(errors.isEmpty()) {
            const post = blogPostsArray.find((post) => post._id === req.params.id)
            const filtered = blogPostsArray.filter(post => post._id !== req.params.id)
            const updatedPost = { ...req.body, createdOn: post.createdOn, _id: post._id, lastUpdatedOn: new Date() }
            filtered.push(updatedPost)
            writeFile(filtered)
            res.status(200).send(post)
        } else {
            next(createError(400, errors))
        }
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", (req, res) => {
    const newPostsArray = blogPostsArray.filter(post => post._id !== req.params.id)
    writeFile(newPostsArray)

    res.send(newPostsArray)

})

export default router
