const jwt=require('jsonwebtoken');
const {secret}=require('./config');
const db=require("./ConnectionDB/db");

module.exports=function (req,res,next){

    if(!req.cookies.token) return next();
    try {
        const decoded=jwt.verify(req.cookies.token,secret);
        db.query('SELECT account.id,user.name,account.description,account.srcImg FROM user,account WHERE user.id=? and user.id=account.user_id;',[decoded.id],(err,result)=>{
            if(err) return next();
            req.user=result[0];
            return next();
        })
    }catch (e) {
        if(e) return next();

    }
};