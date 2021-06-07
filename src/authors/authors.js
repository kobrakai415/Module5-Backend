import express from "express"
import createError from "http-errors"
import uniqid from "uniqid"
import multer from "multer"
import { getAuthors, writeAuthors, writeAuthorAvatars, authorsReadStream } from "../helpers/files.js"
import { Transform } from "json2csv"
import { pipeline } from "stream"
import AuthorModel from "../authors/authorsSchema.js"
import q2m from "query-to-mongo"
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

router.get("/", async (req, res, next) => {
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
     
router.get("/:id", async (req, res, next) => {
    try {
        const author = await AuthorModel.findById(req.params.id)
        res.send(author)
    } catch (error) {
        next(error)
    }
})

router.post("/", async (req, res, next) => {
   try {
    const newAuthor = new AuthorModel(req.body)
    const id  = await newAuthor.save()
    res.send(id)
   } catch (error) {
       next(error)
   }

})

router.put("/:id", async (req, res) => {
    try {
        const author = await AuthorModel.findById(req.params.id)

       if ( author ) {

       const updatedAuthor = await AuthorModel.findByIdAndUpdate(req.params.id, req.body, {runvalidators: true, new: true})
       
       res.send(updatedAuthor)
       } else {
           next(createError(400, "Author not found!"))
       }

    } catch (error) {
        next(error)
    }
})

router.delete("/:id", async (req, res) => {
   try {
       const deleted = await AuthorModel.findByIdAndDelete(req.params.id)

       deleted ? res.send(deleted) : next(createError(400, "Author not found"))
   } catch (error) {
       next(error)
   }
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