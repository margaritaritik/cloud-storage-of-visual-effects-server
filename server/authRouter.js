const Router=require('express');
const router=new Router();
const controller=require('./authController');
const authMiddleware=require('./authMiddleware');
const multer = require("multer");
const path=require('path');

const upload = multer({storage:multer.memoryStorage()});

router.post('/registration',controller.registration);
router.post('/login',controller.login);
router.post('/uploadPhoto',controller.uploadPhoto);
router.post('/upload',upload.single('image'),authMiddleware,controller.upload);
router.post('/upload-image',authMiddleware,controller.uploadPhoto);
router.get('/users',authMiddleware, controller.getUsers);
router.post('/repository',authMiddleware, controller.repository);
// router.post('/',authMiddleware, controller.repository);

module.exports=router;

