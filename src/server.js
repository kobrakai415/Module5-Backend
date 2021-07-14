import express from "express"
import cors from "cors"
import {join, dirname} from "path"
import {fileURLToPath} from "url"
import listEndpoints from "express-list-endpoints"
import userRoutes from "./authors/authors.js"
import postRoutes from "./blogPosts/blogPosts.js"
import {badRequestErrorHandler, notFoundErrorHandler, forbiddenErrorHandler, catchAllErrorHandler} from "./errorHandlers.js"
import createError from "http-errors"
import mongoose from "mongoose"
import pg from "pg"

const publicFolder = join(dirname(fileURLToPath(import.meta.url)), "../public")

const server = express()
const port = process.env.PORT || 3000

const whiteList = [process.env.FRONTEND_DEV_URL, process.env.FRONTEND_CLOUD_URL]

const corsOptions = {
    origin: function (origin, next) {
        console.log(origin)
        try {

            if(whiteList.indexOf(origin) !== -1) {
                console.log(origin)
                next(null, true)
            } else {
            next(createError(500, "Origin Problem!"))
            }
            
        } catch (error) {
            next(error)
        }
    }
}

server.use(express.json())
server.use(express.static(publicFolder))
server.use(cors())

server.use("/authors", userRoutes)
server.use("/blogposts", postRoutes)

server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(forbiddenErrorHandler)
server.use(catchAllErrorHandler)

mongoose.connect(process.env.MONGO_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => server.listen(port, () => {
    console.log("server is running port: ", port)
})).catch(error => console.log(error))

console.table(listEndpoints(server))

export const pool = new pg.Pool();


export async function query(text, params) {

    const start = Date.now();

    const res = await pool.query(text, params);

    const duration = Date.now() - start;

    console.info("Query executed in ", duration, " ms.");

    return res;

}
