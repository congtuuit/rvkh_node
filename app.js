const express = require("express");
const http = require("http");
const optimizeRoutes = require("./routes/optimize");
const videoRoutes = require("./routes/video");

const app = express();

// Sử dụng Express để xử lý các route
app.use(express.json());

// Đặt base URL cho các API
app.use("/app/image-optimizer/api", optimizeRoutes);
//app.use("/app/image-optimizer/api", videoRoutes);

app.use("/app/image-optimizer/video", videoRoutes);
// Route kiểm tra tình trạng server
// app.get("/app/image-optimizer/video", (req, res) => {
//   const message = "Server running!";
//   const version = "NodeJS " + process.versions.node;
//   const response = [message, version].join("\n");

//   res.status(200).send(response);
// });


// Route kiểm tra tình trạng server
app.get("/app/image-optimizer/health", (req, res) => {
  const message = "Server running!";
  const version = "NodeJS " + process.versions.node;
  const response = [message, version].join("\n");

  res.status(200).send(response);
});

//APP APIs
app.get("/app/v1/ping", (req, res) => {
  const message = "Server running!";
  const version = "NodeJS " + process.versions.node;
  const response = [message, version].join("\n");

  res.status(200).send(response);
});


// Khởi tạo server HTTP và lắng nghe
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});
