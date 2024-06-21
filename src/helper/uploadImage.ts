import { Request, Response } from 'express';
const multer = require('multer')
const sharp = require('sharp');

import cloudinary from '../configuration/cloudinaryConfig'; // Assuming you have a valid Cloudinary configuration
import { Readable } from 'stream';
import { result } from 'lodash';

const upload = multer({ dest: 'uploads/' });
const cloudinaryUploader = cloudinary.uploader;

const uploadImage = async (req: Request, res: Response): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
        console.log('Request received');

        // Use multer to handle single file upload
        upload.single('image')(req, res, async (err: any) => {
            if (err) {
                console.error('Multer error', err);
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return reject({ statusCode: 400, message: 'File size exceeds the limit' });
                    }
                    return reject({ statusCode: 500, message: 'Multer error: ' + err.message });
                } else {
                    return reject({ statusCode: 500, message: 'Internal server error: ' + err.message });
                }
            }

            try {
                console.log(req.file);
                const inputPath = req.file?.path;
                console.log(inputPath);
                if (!inputPath) {
                    console.error('No file uploaded');
                    return reject({ statusCode: 400, message: 'No file uploaded' });
                }

                console.log('Upload started');
                // Process the image using sharp (resize, format)
                const transformedImageBuffer = await sharp(inputPath)
                    .resize(300, 300)
                    .toFormat('jpeg')
                    .rotate(0)
                    .toBuffer();

                console.log('Image processing complete. Uploading to Cloudinary...');

                // Use Cloudinary's upload_stream to handle the upload
                const uploadStream = cloudinaryUploader.upload_stream({ resource_type: 'image' }, (uploadError: any, result: any) => {
                    if (uploadError) {
                        console.error(`Error uploading to Cloudinary: ${uploadError}`);
                        return reject({ statusCode: 500, message: 'Error uploading photo' });
                    }

                    console.log('Upload to Cloudinary successful.');
                    // Resolve with the secure_url upon successful upload
                    resolve(result.secure_url);
                });

                // Pipe the transformed image buffer to the upload stream
                const transformedImageStream = new Readable();
                transformedImageStream.push(transformedImageBuffer);
                transformedImageStream.push(null);
                transformedImageStream.pipe(uploadStream);

            } catch (error) {
                console.error('Error handling photo upload:', error);
                return reject({ statusCode: 500, message: 'Error handling photo upload' });
            }
        });
    });
};


export default uploadImage;
