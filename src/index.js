import express from "express"
import fs from "fs"
import { dirname, join} from "path"
import { fileURLToPath } from "url"
import uniqid from "uniqid"

const router = express.Router()

const authorsFile = join(dirname(fileURLToPath(import.meta.url)), "authors.json")
const authorsArray = JSON.parse(fs.readFileSync(authorsFile).toString())

router.get("/", (req, res) => {
    authorsArray > 0 ? res.send(authorsArray) : res.send("No data.")
})

router.get("/:id", (req, res) => {
   const author = authorsArray.find(author => author._id === req.params.id)
   
   author ? res.send(author) : res.send("Author does not exist, check your author ID")
})

router.post("/", (req, res) => {
    if(authorsArray.find(author => author.email === req.body.email)) {
        res.send("email already in use, please try a different email.")
    }
    else { const author = req.body
    author._id = uniqid()
    author.createdOn = new Date()
    authorsArray.push(author)

    fs.writeFileSync(authorsFile, JSON.stringify(authorsArray))

    res.send(author)}
})

router.put("/:id", (req, res) => {
    const newAuthorsArray = authorsArray.filter(author => author._id !== req.params.id)
    const author = authorsArray.find(author => author._id === req.params.id)

    const updatedAuthor = {...req.body, createdOn: author.createdOn, _id: author._id, lastUpdatedOn: new Date()}
    newAuthorsArray.push(updatedAuthor)

    fs.writeFileSync(authorsFile, JSON.stringify(newAuthorsArray))

    res.send(updatedAuthor)
})

router.delete("/:id", (req, res) => {
    const newAuthorsArray = authorsArray.filter(author => author._id !== req.params.id)

    fs.writeFileSync(authorsFile, JSON.stringify(newAuthorsArray))

    res.send("Author deleted successfully")
})

export default router