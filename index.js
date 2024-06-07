const express = require('express')
const fs = require('fs')
const {ConnectMongo} = require('./DB/MongoDb')
const app = express()
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({
    limit:'10kb'
}))
const userinfo_routes = require('./Routes/Userinfo')
const ApiError = require('./middleware/Apierrors')
const CityRoutes = require('./Routes/CityRoutes')
const PlaceRoute = require('./Routes/PlaceRoute')
const StaticContentRoute = require('./Routes/StaticContentRoute')
require("./Modals/placeimage.modal")
require("./Modals/city.modal")
require("./Modals/favorite.modal")
require("./Modals/rating.modal")


ConnectMongo().then(()=>{
  app.listen(5000, () => {
      console.log('server is listening on port 5000')
  })

})


app.use((req, res,next) => {

    try {
        const dataTobeStore = `
        ${req.url}, ${req.method}, ${JSON.stringify(req.body || {})}, ${JSON.stringify(req.query || {})},
        `
        fs.appendFile("./Logs.txt",dataTobeStore,"utf8",()=>{
    
        })
        
    } catch (error) {
        
    }
    next()
})

// Use the error handling middleware

app.use('/user', userinfo_routes)
app.use('/city', CityRoutes)
app.use('/place', PlaceRoute)
app.use('/staticcontent', StaticContentRoute)

app.use((err, req, res, next) => {
    // logic
    let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
  })