const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/Auth')

const  { 
    Login,
    userinfo
} = require('../Controllers/Userinfo/Userinfo')

router.post('/auth', Login)
router.get('/userinfo',verifyToken, userinfo)

module.exports = router