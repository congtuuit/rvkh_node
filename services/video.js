const CryptoJS = require("crypto-js");
const axios = require("axios");

function extractKeyFromUrl(url) {
  try {
    const regex = /videos\/([a-f0-9]{32})\//;
    const match = url.match(regex);
    if (match) {
      return match[1];
    } else {
      throw new Error("Key not found in URL");
    }
  } catch (error) {
    console.error("Error extracting key:", error);
    throw error;
  }
}

function decryptData(url, binaryContent) {
  try {
    const key = extractKeyFromUrl(url);
    const encryptedBytes = CryptoJS.enc.Base64.parse(binaryContent);
    const keyWordArray = CryptoJS.enc.Utf8.parse(key);
    const ivWordArray = CryptoJS.lib.WordArray.create(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    );

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedBytes },
      keyWordArray,
      {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const decryptedBytes = CryptoJS.enc.Latin1.stringify(decrypted);

    console.log("decryptedBytes ", decryptedBytes);
    return decryptedBytes;
  } catch (error) {
    throw error;
  }
}

function decodeToken(token) {
  try {
    const decodedString = CryptoJS.enc.Utf8.stringify(
      CryptoJS.enc.Base64.parse(token)
    );
    const decoded = JSON.parse(decodedString);
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime < decoded.exp; // Trả về true nếu token còn hiệu lực
  } catch (error) {
    return false; // Token không hợp lệ
  }
}

const proxyVideo = async (req, res) => {
  const videoId = req.query.q; // Lấy video ID từ URL
  
  if (!videoId) {
    return res.status(404).json({ error: "Not found" });
  }
  
  const isValid = decodeToken(videoId);
  if (!isValid) {
      return res.status(404).json({ error: "Not found" });
  }
  
  const videoToken = req.header("X-REQUEST-ID"); // Lấy token từ header
  if (!videoToken) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const videoUrl = atob(videoToken); // Giải mã videoToken (Base64 decode)
    const response = await axios.get(videoUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);
    const base64String = buffer.toString("base64");
    const m3u8Content = decryptData(videoUrl, base64String);
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(m3u8Content);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch video data" });
  }
};


const getVideoEmbed = (req, res) => {
  const videoId = req.params.id;

  const iframeHTML = `
        <!doctype html>
        <html>
        <head>
            <title>Video Embed</title>
            <style>
                html, body {
                    margin: 0;
                    padding: 0;
                    background: #000;
                    height: 100%;
                }
                iframe {
                    border: none;
                    width: 100%;
                    height: 100%;
                }
            </style>
        </head>
        <body>
            <iframe src="https://stream.reviewkhoahoc.net/player/${videoId}" allowfullscreen></iframe>
        </body>
        </html>
    `;

  res.send(iframeHTML);
};

module.exports = {
  getVideoEmbed,
  proxyVideo,
};
