import express from "express"
import createError from "http-errors"
import uniqid from "uniqid"
import multer from "multer"
import { getAuthors, writeAuthors, writeAuthorAvatars, authorsReadStream } from "../helpers/files.js"
import { Transform } from "json2csv"
import { pipeline } from "stream"


const router = express.Router()


router.get("/exportCSV", async (req, res, next) => {
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

router.get("/", async (req, res) => {
    await getAuthors().length > 0 ? res.send(authorsArray) : res.send("No data.")
    // const authors = await authorModel.find()

    // res.send(authors)
})

router.get("/:id", async (req, res) => {
    const authors = await getAuthors()

    const author = authors.find(author => author._id === req.params.id)

    author ? res.send(author) : res.send("Author does not exist, check your author ID")
})

router.post("/", async (req, res) => {
    const authors = await getAuthors()

    if (authors.find(author => author.email === req.body.email)) {
        res.send("email already in use, please try a different email.")
    }
    else {
        const author = req.body
        author._id = uniqid()
        author.createdOn = new Date()
        authors.push(author)

        await writeAuthors(authors)

        res.send(author)
    }
// const newAuthor = new authorModel(req.body)
// const id  = await newAuthor.save()
// res.send(id)


})

router.put("/:id", async (req, res) => {
    const authors = await getAuthors()
    const newAuthorsArray = authors.filter(author => author._id !== req.params.id)
    const author = authors.find(author => author._id === req.params.id)

    if (!author) { next(createError(400, "id does not match")) }

    const updatedAuthor = { ...req.body, createdOn: author.createdOn, _id: author._id, lastUpdatedOn: new Date() }
    newAuthorsArray.push(updatedAuthor)

    await writeAuthors(newAuthorsArray)

    res.send(updatedAuthor)
})

router.delete("/:id", async (req, res) => {
    const authors = await getAuthors()
    const newAuthorsArray = authors.filter(author => author._id !== req.params.id)

    await writeAuthors(newAuthorsArray)

    res.send("Author deleted successfully")
})

router.post("/:id/uploadAvatar", multer().single("authorAvatar"), async (req, res, next) => {
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