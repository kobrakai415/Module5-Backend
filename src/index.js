import express from "express"
import fs from "fs"
import { dirname, join} from "path"
import { fileURLToPath } from "url"
import uniqid from "uniqid"

const router = express.Router()

const indexFilePath = fileURLToPath(import.meta.url)
const indexFileDirectory = dirname(indexFilePath)

const authorsFile = join(indexFileDirectory, "authors.json")

const authorsAsBuffer = fs.readFileSync(authorsFile)
const authorsAsString = authorsAsBuffer.toString()
const authorsArray = JSON.parse(authorsAsString)

router.get("/", (req, res) => {
    res.send(authorsArray)
})

router.get("/:id", (req, res) => {
   const author = authorsArray.find(author => author._id === req.params.id)
   
   author ? res.send(author) : res.send("no author found")
})

router.post("/", (req, res) => {
    const author = req.body
    author._id = uniqid()
    author.createdAt = new Date()

    authorsArray.push(user)

    fs.writeFileSync(authorsFile, JSON.stringify(authorsArray))

    res.send(author)
})

router.put("/:id", (req, res) => {
    const updatedAuthor = req.body

    const newAuthorsArray = authorsArray.filter(author => author._id !== req.params.id)
    newAuthorsArray.push(updatedAuthor)

    fs.writeFileSync(authorsFile, JSON.stringify(newAuthorsArray))

    res.send(updatedAuthor)
})

router.delete("/:id", (req, res) => {
    const newAuthorsArray = authorsArray.filter(author => author._id !== req.params.id)

    fs.writeFileSync(authorsFile, JSON.stringify(newAuthorsArray))

    res.send(newAuthorsArray)
})

export default router