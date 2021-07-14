import jwt from "jsonwebtoken"
import AuthorModel from "../authors/authorsSchema.js"


const secret = process.env.JWT_SECRET
const refreshSecret = process.env.JWT_REFRESH_SECRET

export const JWTAuthenticate = async (user) => {
    const accessToken = await generateJWT({ _id: user._id })
    const refreshToken = await generateRefreshJWT({ _id: user._id })
    user.refreshToken = refreshToken
    await user.save()
    return { accessToken, refreshToken }
}

const generateJWT = payload =>
    new Promise((resolve, reject) => jwt.sign(payload, secret, { expiresIn: "1 hour" }, (err, token) => (err ? reject(err) : resolve(token))))

const generateRefreshJWT = payload =>
    new Promise((resolve, reject) =>
        jwt.sign(payload, refreshSecret, { expiresIn: "1 day" }, (err, token) => (err ? reject(err) : resolve(token)))
    )


export const verifyToken = token =>
    new Promise((resolve, reject) =>
        jwt.verify(token, secret, (err, decodedToken) => (err ? reject(err) : resolve(decodedToken)))
    )

export const verifyRefreshToken = token => {
    new Promise((resolve, reject) => {
        jwt.verify(token, refreshSecret, (err, decodedToken))
        if (err) reject(err)

        resolve(decodedToken)
    })
}


export const refreshTokens = async (actualRefreshToken) => {

    const verified = await verifyRefreshToken(actualRefreshToken)
    const user = AuthorModel.findById(verified._id)

    if (!user) throw new Error("User not found")

    if (user.refreshToken === actualRefreshToken) {
        const newAccessToken = await generateJWT({ _id: user._id })
        const newRefreshToken = await generateRefreshJWT({ _id: user._id })
        user.refreshToken = newRefreshToken

        await user.save()

        return { newAccessToken, newRefreshToken }
    } else {
        throw new Error("Refresh token not valid!")
    }
}