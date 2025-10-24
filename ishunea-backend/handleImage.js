const multer = require('multer');
const { uploadToR2, uploadMultipleToR2 } = require('./r2-storage');

// Use memory storage instead of disk storage
const memoryStorage = multer.memoryStorage();

// Multer instances for different upload types - now using memory storage
const uploadJobs = multer({ storage: memoryStorage });
const uploadWork = multer({ storage: memoryStorage });
const uploadBlogs = multer({ storage: memoryStorage });
const uploadTeam = multer({ storage: memoryStorage });
const uploadServices = multer({ storage: memoryStorage });
const uploadNone = multer().none();

/**
 * Upload files from request to R2 and update object with URLs
 * @param {Object} req - Express request object with files
 * @param {Object} inputObject - Object to update with file URLs
 * @param {string} folder - R2 folder name (blogs, services, team, work)
 */
async function updateObjectWithUploadedFiles(req, inputObject, folder) {
    if (!req.files || req.files.length === 0) {
        return;
    }

    // Helper function to set the value at the correct path dynamically
    const setObjectValueByPath = (obj, pathString, value) => {
        const pathArray = pathString
            .replace(/\[(\w+)\]/g, '.$1')
            .split('.');
        
        pathArray.reduce((acc, key, idx) => {
            if (idx === pathArray.length - 1) {
                acc[key] = value;
            } else {
                if (!acc[key]) {
                    acc[key] = isNaN(Number(pathArray[idx + 1])) ? {} : [];
                }
                return acc[key];
            }
        }, obj);
    };

    try {
        // Upload each file to R2
        for (const file of req.files) {
            // Extract folder name from path (remove '/images/' prefix if exists)
            const folderName = folder.replace('/images/', '').replace('/', '');
            
            // Upload to R2
            const publicUrl = await uploadToR2(
                file.buffer,
                file.originalname,
                folderName,
                file.mimetype
            );

            // Update object with R2 URL
            setObjectValueByPath(inputObject, file.fieldname, publicUrl);
            
            console.log(`File uploaded to R2: ${file.fieldname} -> ${publicUrl}`);
        }
    } catch (error) {
        console.error('Error uploading files to R2:', error);
        throw error;
    }
}

module.exports = {
    uploadJobs,
    uploadWork,
    uploadBlogs,
    uploadTeam,
    uploadNone,
    uploadServices,
    updateObjectWithUploadedFiles
};
