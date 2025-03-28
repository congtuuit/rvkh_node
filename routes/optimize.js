const express = require("express");
const { optimizeImagesInDirectory } = require("../services/optimize");

const router = express.Router();

// API tối ưu hóa thư mục ảnh
router.post("/optimize", async (req, res) => {
  const { directory } = req.body;

  if (!directory) {
    return res
      .status(400)
      .json({ error: "Thư mục cần tối ưu không được cung cấp." });
  }

  const targetDirectory = "../public_html/wp-content/uploads/" + directory;

  try {
    const logs = await optimizeImagesInDirectory(targetDirectory);
    res
      .status(200)
      .json({ success: true, logs, message: "Tối ưu hóa hoàn tất!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//APP APIs
app.get("/v1/ping", (req, res) => {
  const message = "Server running!";
  const version = "NodeJS " + process.versions.node;
  const response = [message, version].join("\n");

  res.status(200).send(response);
});


module.exports = router;
