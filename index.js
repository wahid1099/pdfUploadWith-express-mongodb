const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
//middlewares
app.use(cors());
app.use(express.json());
app.use("/upload", express.static(path.join(__dirname, "upload")));

// File upload folder
const UPLOADS_FOLDER = "./upload/";

// var upload = multer({ dest: UPLOADS_FOLDER });
//connection string in mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.byzxg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
//connecting database
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// define the storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    console.log(fileExt);

    const fileName =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();

    cb(null, fileName + fileExt);
  },
});

// preapre the final multer upload object
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000, // 1MB
  },
  fileFilter: (req, file, cb) => {
    console.log(file);
    if (file.fieldname === "doc") {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only .pdf format allowed!"));
      }
    } else {
      cb(new Error("There was an unknown error!"));
    }
  },
});

// express app initialization
// const app = express();

// application route

client.connect((err) => {
  console.log("data received");
  // Create collection
  const pdfCollection = client.db("Pdfs").collection("pdfFiles");
  app.post("/", upload.single("doc"), async (req, res, next) => {
    const pdfPath = req.file.path;
    console.log(pdfPath);
    const result = await pdfCollection.insertOne({ pdfPath: pdfPath });

    res.send("success");
    // console.log(req);
  });

  app.get("/pdfs", async (req, res, next) => {
    const result = pdfCollection.find({});
    const allpdfs = await result.toArray();
    res.json(allpdfs);
  });
  //const cursor=servicecollection.find({});
});

// // default error handler
// app.use((err, req, res, next) => {
//   if (err) {
//     if (err instanceof multer.MulterError) {
//       res.status(500).send("There was an upload error!");
//     } else {
//       res.status(500).send(err.message);
//     }
//   } else {
//     res.send("success");
//   }
// });

// application route
app.get("/pdfupload", (req, res) => {
  console.log("hi");
});

app.listen(8000, () => {
  console.log("app listening at port 5000");
});
