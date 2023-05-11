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
router.post('/createRepository',authMiddleware, controller.createRepository);
router.post('/changeRepository',authMiddleware, controller.changeRepository);
router.delete('/deleteRepository/:id',authMiddleware, controller.deleteRepository);
router.post('/createComment',authMiddleware, controller.createCommentForEffect);
router.get('/getComments/:effect_id',authMiddleware, controller.getCommentsForEffect);
router.get('/getAccount/:account_id',authMiddleware, controller.getAccount);
router.post('/repository',authMiddleware, controller.repository);
router.get('/effects',authMiddleware, controller.getEffects);
router.delete('/effects',authMiddleware, controller.getEffects);



module.exports=router;

