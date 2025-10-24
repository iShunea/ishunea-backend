const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure R2 client with Cloudflare credentials
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = 'ishunea-website';
const PUBLIC_URL = 'https://pub-5f717ff8ac2547518a948927d4095516.r2.dev';

/**
 * Upload a file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original file name
 * @param {string} folder - Folder path in bucket (e.g., 'blogs', 'services')
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToR2(fileBuffer, originalName, folder, mimeType) {
  try {
    // Generate unique filename
    const fileExtension = path.extname(originalName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await r2Client.send(command);

    // Return public URL
    const publicUrl = `${PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error(`Failed to upload file to R2: ${error.message}`);
  }
}

/**
 * Upload multiple files to R2
 * @param {Array} files - Array of file objects with buffer, originalname, mimetype
 * @param {string} folder - Folder path in bucket
 * @returns {Promise<Array>} - Array of public URLs
 */
async function uploadMultipleToR2(files, folder) {
  const uploadPromises = files.map(file => 
    uploadToR2(file.buffer, file.originalname, folder, file.mimetype)
  );
  return Promise.all(uploadPromises);
}

module.exports = {
  uploadToR2,
  uploadMultipleToR2,
  r2Client,
};
