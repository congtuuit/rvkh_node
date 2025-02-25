const sharp = require("sharp");
const fs = require("fs/promises");
const path = require("path");

const SIZE_THRESHOLD = 100 * 1024; // 300KB

// Hàm tối ưu hóa 1 ảnh
async function optimizeImage(imagePath, logs) {
  try {
    let currentSize;
    //do {
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      const tempFilePath = `${imagePath}.tmp`;

      if (metadata.format === "png") {
        await image.png({ quality: 80 }).toFile(tempFilePath);
      } else if (metadata.format === "jpeg" || metadata.format === "jpg") {
        await image.jpeg({ quality: 85 }).toFile(tempFilePath);
      } else {
        const unsupportedMsg = `Bỏ qua: Định dạng ảnh ${metadata.format} không được hỗ trợ.`;
        console.warn(unsupportedMsg);
        logs.push({ status: "skipped", message: unsupportedMsg });
        return;
      }

      await fs.rename(tempFilePath, imagePath);
      currentSize = (await fs.stat(imagePath)).size;

      const optimizeMsg = `✅  Tối ưu hóa thêm: ${imagePath} (${(currentSize / 1024).toFixed(2)} KB)`;
      console.log(optimizeMsg);
      logs.push({ status: "optimized", message: optimizeMsg });
    //} while (currentSize > SIZE_THRESHOLD);

    const successMsg = `🎯  File đã tối ưu dưới ngưỡng: ${imagePath}`;
    console.log(successMsg);
    logs.push({ status: "completed", message: successMsg });
  } catch (error) {
    const errorMsg = `❌  Lỗi khi tối ưu hóa ảnh "${imagePath}": ${error.message}`;
    console.error(errorMsg);
    logs.push({ status: "error", message: errorMsg });
  }
}

// Hàm đệ quy để quét toàn bộ file ảnh trong thư mục (bao gồm thư mục con)
async function scanAndOptimizeImages(directory, logs) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        // Nếu là thư mục, đệ quy tiếp
        await scanAndOptimizeImages(entryPath, logs);
      } else if (entry.isFile() && /\.(png|jpe?g)$/i.test(entry.name)) {
        // Nếu là file ảnh, kiểm tra kích thước và xử lý
        const stats = await fs.stat(entryPath);

        if (stats.size > SIZE_THRESHOLD) {
          const processingMsg = `📂 Đang xử lý: ${entryPath} (${(stats.size / 1024).toFixed(2)} KB)`;
          console.log(processingMsg);
          logs.push({ status: "processing", message: processingMsg });
          await optimizeImage(entryPath, logs);
        } else {
          const skipMsg = `🔍 Bỏ qua: ${entryPath} (${(stats.size / 1024).toFixed(2)} KB nhỏ hơn 300KB)`;
          console.log(skipMsg);
          //logs.push({ status: "skipped", message: skipMsg });
        }
      }
    }
  } catch (error) {
    const errorMsg = `❌  Lỗi khi quét thư mục "${directory}": ${error.message}`;
    console.error(errorMsg);
    logs.push({ status: "error", message: errorMsg });
  }
}

// Hàm tối ưu hóa toàn bộ ảnh trong thư mục
async function optimizeImagesInDirectory(directory) {
  const logs = []; // Mảng lưu trữ các log
  try {
    // Kiểm tra sự tồn tại của thư mục
    try {
      await fs.access(directory);
    } catch (error) {
      const notFoundMsg = `Thư mục ${directory} không tồn tại!`;
      console.error(notFoundMsg);
      logs.push({ status: "error", message: notFoundMsg });
      throw new Error(notFoundMsg);
    }

    await scanAndOptimizeImages(directory, logs);

    const successMsg = "🎉 Tối ưu hóa hoàn tất!";
    console.log(successMsg);
    logs.push({ status: "success", message: successMsg });
  } catch (error) {
    const errorMsg = `❌  Lỗi khi xử lý thư mục: ${error.message}`;
    console.error(errorMsg);
    logs.push({ status: "error", message: errorMsg });
  }
  return logs; // Trả về danh sách log
}

module.exports = {
  optimizeImagesInDirectory,
};
