const cloudinary = require("../config/cloudinary");

function uploadBuffer(buffer, { folder, publicId, resourceType = "raw" }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: resourceType, format: "pdf" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

module.exports = uploadBuffer;
