import createError from 'http-errors'

export const checkEditPrivileges = (req, res, next) => {
    if (req.user.role === "Admin" || req.user._id === req.params.id) next()
    else next(createError(403, "Unauthorized"))
}

