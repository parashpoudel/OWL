const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { auth } = require("../middleware/auth");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});


router.post("/", auth, upload.array("images", 5), async (req, res) => {

  try {

    const uploadPromises = req.files.map(file => {

      return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "owl-blogs"
          },

          (error, result) => {

            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                caption: ""
              });
            }

          }
        );


        stream.end(file.buffer);

      });

    });


    const images = await Promise.all(uploadPromises);


    res.json({
      success:true,
      images
    });


  } catch(error){

    console.error(error);

    res.status(500).json({
      error:error.message
    });

  }

});


module.exports = router;