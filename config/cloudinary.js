const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Factory: creates a multer upload middleware for a given folder
const createUpload = (folder) => {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `csgn/${folder}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
        }
    });
    return multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
};

// Delete a file from Cloudinary by its URL
const deleteFromCloudinary = async (url) => {
    try {
        if (!url || !url.includes('cloudinary')) return;
        // Extract public_id from URL: .../csgn/swimmers/filename.jpg -> csgn/swimmers/filename
        const parts = url.split('/');
        const filename = parts[parts.length - 1].split('.')[0];
        const folder = parts[parts.length - 2];
        const parentFolder = parts[parts.length - 3];
        const publicId = `${parentFolder}/${folder}/${filename}`;
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Cloudinary delete error:', err.message);
    }
};

module.exports = { cloudinary, createUpload, deleteFromCloudinary };