import express from "express"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import userRoutes from "./index.js"

const server = express()
const port = 3001

server.use(cors())
server.use(express.json())
server.use("/authors", userRoutes)

server.listen(port, () => {
    console.log("server is running port: ", port)
})

console.table(listEndpoints(server))


