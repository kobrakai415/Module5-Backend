import express from "express"
import createError from "http-errors"
import basicAuth from "../authentication/basic.js"
import multer from "multer"
import { getAuthors, writeAuthors, writeAuthorAvatars, authorsReadStream } from "../helpers/files.js"
import { Transform } from "json2csv"
import { pipeline } from "stream"
import AuthorModel from "../authors/authorsSchema.js"
import q2m from "query-to-mongo"
import { LoginValidator } from "../helpers/validators.js"
import { JWTAuthenticate } from "../authentication/JWT.js"
import { validationResult } from "express-validator"
import { JWTAuthMiddleware } from "../authentication/basic.js"

const router = express.Router()

router.post("/signup", async (req, res, next) => {
    try {
        const newAuthor = new AuthorModel(req.body)
        const { id } = await newAuthor.save()
        res.status(201).send(id)

    } catch (error) {
        next(error)
    }
})

router.post("/login", LoginValidator, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) next(createError(400, errors.mapped()))

        const { email, password } = req.body
        const user = await AuthorModel.checkCredentials(email, password)

        if (user) {
            const { accessToken, refreshToken } = await JWTAuthenticate(user)
            res.send({ accessToken, refreshToken })
        } else {
            next(createError(404, "User not found"))
        }

    } catch (error) {
        next(error)
    }
})

router.get("/exportCSV", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const source = await authorsReadStream()

        const fields = ["name", "surname", "email"]
        const opts = { fields }
        const json2csv = new Transform(opts)

        res.setHeader("Content-Disposition", `attachment; filename=authors.csv`)

        pipeline(source, json2csv, res, (error) => {
            if (error) next(error)
        })
    } catch (error) {
        next(error)
    }

})

router.get("/", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const query = q2m(req.query)
        const total = await AuthorModel.countDocuments(query.criteria)

        const result = await AuthorModel
            .find(query.criteria)
            .sort(query.options.sort)
            .skip(query.options.skip || 0)
            .limit(query.options.limit || 5)
        res.status(200).send({ links: query.links("/authors", total), total, result })
    } catch (error) {
        next(error)
    }
})

router.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
        res.send(req.user)
    } catch (error) {
        next(error)
    }
})

router.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const user = await AuthorModel.findById(req.params.id)
        user ? res.send(user) : next(createError(404, "User not found!"))
    } catch (error) {
        next(error)
    }
})

router.post("/", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const newAuthor = new AuthorModel(req.body)
        const id = await newAuthor.save()
        res.send(id)
    } catch (error) {
        next(error)
    }

})

router.put("/me", JWTAuthMiddleware, async (req, res) => {
    try {
        const author = await AuthorModel.findById(req.params.id)

        if (author) {

            const updatedAuthor = await AuthorModel.findByIdAndUpdate(req.params.id, req.body, { runvalidators: true, new: true })

            res.send(updatedAuthor)
        } else {
            next(createError(400, "Author not found!"))
        }
    } catch (error) {
        next(error)
    }
})

router.put("/:id", JWTAuthMiddleware, async (req, res) => {
    try {
        const author = await AuthorModel.findById(req.params.id)

        if (author) {

            const updatedAuthor = await AuthorModel.findByIdAndUpdate(req.params.id, req.body, { runvalidators: true, new: true })

            res.send(updatedAuthor)
        } else {
            next(createError(400, "Author not found!"))
        }
    } catch (error) {
        next(error)
    }
})


router.delete("/:id", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const deleted = await AuthorModel.findByIdAndDelete(req.params.id)
        console.log(deleted)
        deleted ? res.send(deleted) : next(createError(400, "Author not found"))
    } catch (error) {
        next(error)
    }
})

router.post("/:id/uploadAvatar", JWTAuthMiddleware, multer().single("authorAvatar"), async (req, res, next) => {
    try {
        console.log(req.file)
        const authors = await getAuthors()

        let author = authors.find(author => author._id === req.params.id)
        if (!author) { next(createError(400, "id does not match")) }

        await writeAuthorAvatars(req.params.id + ".jpg", req.file.buffer)

        author.avatar = `http://localhost:3001/images/authorAvatars/${req.params.id}.jpg`

        const newAuthors = authors.filter(author => author._id !== req.params.id)
        newAuthors.push(author)
        await writeAuthors(newAuthors)

        res.status(200).send("Image uploaded successfully")

    } catch (error) {
        next(error)
    }
})

export default router