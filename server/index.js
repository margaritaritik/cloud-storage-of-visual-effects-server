const express=require('express');
const authRouter=require('./authRouter');
const cookies = require("cookie-parser");
const PORT=process.env.PORT||9003;
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(
    cors({
        credentials: true, // чтобы работали secured куки
        origin: true // автоматом подставляется текущий сервер в Origin
    })
);

app.use(cookies());
app.use(bodyParser.urlencoded());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use("/uploads",express.static(path.join(__dirname,"uploads")));
// app.use(express.static('./uploads'));
// app.use(express.static(path.join(__dirname,"public")));

app.use("/image", express.static("image"));

// let imageName = "";
// const storage = multer.diskStorage({
//     destination: path.join("./image"),
// filename: function (req, file, cb) {
//     imageName = Date.now() + path.extname(file.originalname);
//     cb(null, imageName);
// },
// });
// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 3000000 },
// }).single("image");
// app.post("/auth/upload-image", (req, res) => {
//     upload(req, res, (err) => {
//         if (err) {
//             console.log(err);
//         } else {
//             return res.status(201)
//                 .json({ url: "http://127.0.0.1:9003/image/" + imageName });
//         }
//     });
// });



app.use("/auth",authRouter);
(async () => {
    app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}!`)
    });
})();

