const mysql = require("mysql");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {secret} = require("./config");
const db=require("./ConnectionDB/db");
const fs = require('fs');
const COOKIE_NAME = "token";
const multer = require('multer')
const path = require("path");

const generateAccessToken = (id, name) => {
    const payload = {
        id,
        name
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"});
}

let imageName = "";
const storage = multer.diskStorage({
    destination: path.join("./image"),
    filename: function (req, file, cb) {
        imageName = Date.now() + path.extname(file.originalname);
        cb(null, imageName);
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 3000000 },
}).single("image");

class authController {
    async registration(req, res) {
        try {
            let username = req.body.login;
            let password = req.body.password;
            db.query('select * from user where name=(?);', [username], function (err, results, fields) {
                if (results.length > 0) {
                    console.log("Пользователь уже есть с таким логином!");
                    return res.json({message:'Пользователь уже есть с таким логином!'});
                } else {
                    const hashPassword = bcrypt.hashSync(password, 7);
                    db.query('insert into user (name,password,typeuser_id) values(?,?,2)', [username, hashPassword], function (err, results, fields) {
                        if (err) console.log(err);
                        else {
                            console.log("Данные добавлены");
                            db.query('SELECT * FROM user ORDER BY id DESC LIMIT 1;', function (err, results, fields) {
                                if (results.length > 0) {
                                    // console.log(results[0].id);
                                    db.query('insert into `account` (description,user_id,srcImg) values(\'Это не баг, это фича\',?,"http://127.0.0.1:9003/image/ImagesForClient/avatar.svg");',[results[0].id], function (err, results, fields) {
                                        console.log("Пользователь создан!");
                                    });
                                } else {
                                   return res.json("no no no")
                                }
                            });
                        }
                        return res.json({message:'Пользователь зарегистрирован!'});
                        res.end();
                    });
                }

            });
        } catch (e) {
            console.log(e);
        }
    }

    async login(req, res) {
        try {
            let username = req.body.login;
            let password = req.body.password;
            // console.log(req.body)
            if (!username || !password) {
                res.status(400).json({message: 'Please enter Username and Password!'});
                return res.end();
            }
            db.query('select * from user where name=(?);', [username], function (err, results, fields){
                if (results.length > 0) {
                    const validPassword = bcrypt.compareSync(password, results[0].password);
                    if (!validPassword) {
                        console.log("Данные не верны!");
                        return res.status(400).json({message: 'Не верный пароль!!'});
                    }
                    const token = generateAccessToken(results[0].id, results[0].name);

                    res.cookie(COOKIE_NAME, token, {
                        maxAge: 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'none',
                        secure: true
                    });
                    res.status(200).json(token);
                } else {
                    console.log("Данные не верны!");
                    res.status(401).json({message: 'Incorrect Username and/or Password!'});
                }
                res.end();
            });
        } catch (e) {
            console.log(e);
        }
    }

    async getUsers(req, res) {
        try {
            if(req.user){
                // console.log(req.user);
                res.status(200).json({user:req.user});
            }else{
                res.status(401).json({user:'nothing'});
            }
        } catch (e) {
            console.log(e);
        }
    }

    async getEffects(req, res) {
        try {
            let effects=[];
            if(req.user){

                db.query('SELECT effect.id,effect.name,effect.description,effect.typeeffect_id,effect.css,effect.js,effect.html,effect.account_id,account.srcImg FROM effect, account where account.id=effect.account_id',function (err, results, fields){
                    if (results.length > 0) {
                        for(let i=0;i<results.length;i++){

                            effects[i]={id:results[i].id,name:results[i].name,description:results[i].description,typeeffect_id:results[i].typeeffect_id,
                                css:results[i].css,js:results[i].js,html:results[i].html,account_id:results[i].account_id,srcImg:results[i].srcImg};                        }
                        // console.log(effects)
                    } else {
                        console.log("Данные не верны!");
                        res.status(401).json({message: 'Incorrect Username and/or Password!'});
                    }
                    res.status(200).json(effects);
                    res.end();
                });


            }else{
                res.status(401).json({user:'nothing'});
            }
        } catch (e) {
            console.log(e);
        }
    }


    async repository(req, res) {
        try {
            if(req.user){
                // console.log(req.body);
                res.status(200).json({user:req.user});
            }else{
                res.status(401).json({user:'nothing'});
            }
        } catch (e) {
            console.log(e);
        }
    }

    async createRepository(req, res) {
        try {
            if(req.user){
                db.query('insert into `effect` (name,description,html,css,js,typeeffect_id,account_id) values(?,?,?,?,?,?,?);',[req.body.name,req.body.description,req.body.html,req.body.css,req.body.js,req.body.typeeffect_id,req.body.account_id], function (err, results, fields) {
                    console.log("Сохранено!");
                });
                res.status(200).json({user:req.user});
                res.end();
            }else{
                res.status(401).json({user:'nothing'});
            }

        } catch (e) {
            console.log(e);
        }
    }

    async changeRepository(req, res) {
        try {
            // console.log((req.body.html).replace(`"`,`'`));
             console.log(`UPDATE effect SET name="${req.body.name}",description="${req.body.description}" , html="${(req.body.html).replace(`"`,`'`)}", css="${req.body.css}",js="${req.body.js}" ,typeeffect_id=${req.body.typeeffect_id} where id=${req.body.id};`);
            if(req.user){
                db.query(`UPDATE effect SET name="${req.body.name}",description="${req.body.description}" , html="${(req.body.html).replace(`"`,`'`)}", css="${(req.body.css).replace(`"`,`'`)}",js="${req.body.js}" ,typeeffect_id=${req.body.typeeffect_id} where id=${req.body.id};`, function (err, results, fields) {
                    console.log("Изменено!");
                });
                res.status(200).json({user:req.user});
                res.end();
            }else{
                res.status(401).json({user:'nothing'});
            }

        } catch (e) {
            console.log(e);
        }
    }

    async changeUser(req, res) {
        try {
            // console.log(`UPDATE effect SET name="${req.body.name}",description="${req.body.description}" , html="${req.body.html}", css="${req.body.css}",js="${req.body.js}" ,typeeffect_id=${req.body.typeeffect_id} where id=${req.body.id};`);
            if(req.user){
                db.query(`UPDATE effect SET name="${req.body.name}",description="${req.body.description}" , html="${req.body.html}", css="${req.body.css}",js="${req.body.js}" ,typeeffect_id=${req.body.typeeffect_id} where id=${req.body.id};`, function (err, results, fields) {
                    console.log("Изменено!");
                });
                res.status(200).json({user:req.user});
                res.end();
            }else{
                res.status(401).json({user:'nothing'});
            }

        } catch (e) {
            console.log(e);
        }
    }

    async createCommentForEffect(req, res) {
        try {
            if(req.user){
                db.query(`insert into comment(comment_name,account_id,effect_id) values(?,?,?);`,[req.body.name,req.body.account_id,req.body.effect_id], function (err, results, fields) {
                     console.log("Коммент создан!");
                });
                return res.status(200).json({user:req.user});
                res.end();
            }else{
                return res.status(401).json({user:'nothing'});
            }

        } catch (e) {
            console.log(e);
        }
    }

    async deleteRepository(req, res) {
        try {
        //    console.log(req.body.name);
            const effectId=req.params["id"]
            console.log(effectId);
            if(req.user){
                db.query(`delete from comment where effect_id=?;`,[effectId], function (err, results, fields) {
                    db.query(`DELETE FROM effect WHERE id=?;`,[effectId], function (err, results, fields) {
                        console.log("Эффект удалн!");
                    });
                });

                return res.status(200).json({user:req.user});
                res.end();
            }else{
                return res.status(401).json({user:'nothing'});
            }

        } catch (e) {
            console.log(e);
        }
    }

    async getCommentsForEffect(req, res) {
        try {
            let comments=[];
            const effectId=req.params["effect_id"]
            if(req.user){

                db.query('select comment.comment_name,account.id,account.srcImg from comment,account where comment.account_id=account.id and comment.effect_id=?;',[effectId],function (err, results, fields){
                    if (results.length > 0) {
                        for(let i=0;i<results.length;i++){

                            comments[i]={account_id:results[i].id,comment_name:results[i].comment_name,srcImg:results[i].srcImg};
                        }
                        // console.log(comments);
                    } else {
                        console.log("Данные не верны!");
                        res.status(401).json({message: 'I!'});
                        return res.end();
                    }
                    res.status(200).json(comments);
                    res.end();
                });


            }else{
                res.status(401).json({user:'nothing'});
            }
        } catch (e) {
            console.log(e);
        }
    }

    async likeRep(req, res) {
        try {
            if(req.user){
                db.query('select * from like_rep where id_account=? and id_rep=?;',[req.body.id_account,req.body.id_rep],function (err, results, fields) {
                    if (results.length<= 0) {
                        db.query('insert into like_rep(id_account,id_rep) values(?,?);', [req.body.id_account, req.body.id_rep], function (err, results, fields) {
                            console.log("Сохранено!");
                        });
                    }
                res.status(200).json({user:req.user});
                res.end();
                })
            }else{
                res.status(401).json({user:'nothing'});
            }

        } catch (e) {
            console.log(e);
        }
    }

    async likeRepDelete(req, res) {
        try {
            if(req.user){
                db.query('select * from like_rep where id_account=? and id_rep=?;',[req.body.id_account,req.body.id_rep],function (err, results, fields) {
                    if (results.length> 0) {
                        db.query('delete from like_rep where id_account=? and id_rep=?;', [req.body.id_account, req.body.id_rep], function (err, results, fields) {
                            console.log("Сохранено!");
                        });
                    }
                    res.status(200).json({user:req.user});
                    res.end();
                })
            }else{
                res.status(401).json({user:'nothing'});
            }

        } catch (e) {
            console.log(e);
        }
    }
    async getLikeRep(req, res) {
        let like=[];
        const accountId=req.params["account_id"];
        console.log(accountId);
        try {
            if(req.user){
                db.query('select * from like_rep where id_account=?;',[accountId],function (err, results, fields) {
                    for (let i = 0; i < results.length; i++) {
                        like[i]=results[i].id_rep;

                    }
                    res.status(200).json(like);
                    res.end();
                })
            }else{
                res.status(401).json({user:'nothing'});
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getAccount(req, res) {
        try {
            const effectId=req.params["account_id"];

            if(req.user){

                db.query('SELECT account.id,user.name,account.description,account.srcImg FROM user, account WHERE account.id=? and user.id=account.user_id group by account.id,user.name,account.description,account.srcImg;',[effectId],function (err, results, fields){
                    if (results.length > 0) {
                        res.status(200).json(results[0]);
                    } else {
                        console.log("Данные не верны!");
                        res.status(401).json({message: 'Incorrect Username and/or Password!'});
                    }
                    res.end();
                });


            }else{
                res.status(401).json({user:'nothing'});
            }
        } catch (e) {
            console.log(e);
        }
    }

    async upload(req, res) {
        try {
            console.log(req.file)
            if(req.user){
                const image=req.file.buffer.toString('base64');
                const q=`UPDATE account set  srcImg="${image}" where user_id=?`;
                db.query(q,[req.user.id],(err,rows,fields)=>{
                    if(err) throw err;
                })
                console.log(`upload ${req.user.id}`);
                res.status(200).json({user:req.user});
            }else{
                res.status(401).json({user:'nothing'});
            }
        } catch (e) {
            console.log(e);
        }
    }



    async uploadPhoto(req, res) {
        try {
            console.log(`uploadPhoto^ ${req.user}`)
            if(req.user){
                upload(req, res, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const src=`http://127.0.0.1:9003/image/${imageName}`
                        const q=`UPDATE account set  srcImg="${src}" where id=?`;
                        db.query(q,[req.user.id],(err,rows,fields)=>{
                            if(err) throw err;
                        })
                         return res.status(201)
                             .json({user:req.user.id, url: "http://127.0.0.1:9003/image/" + imageName });
                    }
                });
            }else{
                res.status(401).json({user:'nothing'});
            }


            console.log()
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new authController();