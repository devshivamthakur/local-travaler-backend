const express = require('express')
const router = express.Router()

const  {
    getStaticContent
} = require('../Controllers/StaticContent/StaticContent')

router.get('/', getStaticContent)

module.exports = router