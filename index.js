const express = require('express')
const app = express()
const userinfo_routes = require('./Routes/Userinfo')
const CityRoutes = require('./Routes/CityRoutes')

app.listen(5000, () => {
    console.log('server is listening on port 5000')
})

app.use(express.json())
app.use('/user', userinfo_routes)
app.use('/city', CityRoutes)
