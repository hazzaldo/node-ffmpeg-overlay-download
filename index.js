const express = require('express');
const fileUpload = require('express-fileupload');
const expressFileUpload = require('express-fileupload');
const ffmpeg = require('fluent-ffmpeg');
const fs = require("fs");

const app = express();
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  expressFileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// set the path for the Ffmpeg libraries (binaries)
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/ffmpeg/bin/ffprobe.exe");
ffmpeg.setFlvtoolPath("C:/flvtool");

app.get('/', (req,res) => {
  res.sendFile(__dirname + '/index.html')
});

app.post('/convert', (req,res) => {
  let to = req.body.to
  let file = req.files.file
  console.log(to)
  console.log(file)
  let fileName = `output.${to}`;
  file.mv('tmp/' + file.name, function (err) {
    if (err) return res.sendStatus(500).send(err);
    console.log("File uploaded successfully");
  });

  
    // Code for overlay should go here ...



    // Download file code
    ffmpeg("tmp/" + file.name)
    .withOutputFormat(to)
    .on("end", function (stdout, stderr) {
      console.log("Finished");
      res.download(__dirname + fileName, function (err) {
        if (err) throw err;

        fs.unlink(__dirname + fileName, function (err) {
          if (err) throw err;
          console.log("File deleted");
        });
      });
      fs.unlink("tmp/" + file.name, function (err) {
        if (err) throw err;
        console.log("File deleted");
      });
    })
    .on("error", function (err) {
      console.log("an error happened: " + err.message);
      fs.unlink("tmp/" + file.name, function (err) {
        if (err) throw err;
        console.log("File deleted");
      });
    })
    .saveToFile(__dirname + fileName);
});

app.listen(4000, () => {
  console.log("App is listening on port 4000");
});