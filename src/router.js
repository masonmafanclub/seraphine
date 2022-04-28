import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";

import Media from "./model";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "/home/seraphine/uploads");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  if (
    req.file &&
    (req.file.mimetype == "image/jpeg" ||
      req.file.mimetype == "image/png" ||
      req.file.mimetype == "image/gif")
  ) {
    let media = new Media({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
    });
    console.log(media);
    await media.save();
    res.json({ mediaid: media._id });
  } else {
    res.json({
      error: true,
      description: "invalid file",
    });
  }
});

router.get("/access/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({
      error: true,
      description: "invalid id",
    });

  Media.findById(req.params.id).then(function (r) {
    res.status(200).sendFile(r.path);
  });
});

export default router;
