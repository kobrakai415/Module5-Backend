
export const badRequestErrorHandler = (err, req, res, next) => {
    if(err.status === 400) {
        res.status(400).send(err)
    } else {
        next(err)
    }
}

export const forbiddenErrorHandler = (err, req, res, next) => {
    if (err.status === 403) {
      res.status(403).send(err)
    } else {
      next(err)
    }
  }

  export const notFoundErrorHandler = (err, req, res, next) => {
    if (err.status === 404) {
      res.status(404).send(err.message)
    } else {
      next(err) 
    }
  }

  export const catchAllErrorHandler = (err, req, res, next) => {
    console.log("error message", err)
    res.status(500).send(err)
  }