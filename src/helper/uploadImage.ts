import { Request, Response } from 'express';
const multer = require('multer')
const sharp = require('sharp');
const fs = require("fs");

import cloudinary from '../configuration/cloudinaryConfig';
import { Readable } from 'stream';

const upload = multer({ dest: 'uploads/' });
const cloudinaryUploader = cloudinary.uploader;

const uploadImage = async (req: Request, res: Response): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {

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
                const inputPath = req.file?.path;
                if (!inputPath) {
                    console.error('No file uploaded');
                    return reject({ statusCode: 400, message: 'No file uploaded' });
                }

                // Process the image using sharp (resize, format)
                const transformedImageBuffer = await sharp(inputPath)
                    .resize(300, 300)
                    .toFormat('jpeg')
                    .rotate(0)
                    .toBuffer();


                // Use Cloudinary's upload_stream to handle the upload
                const uploadStream = cloudinaryUploader.upload_stream({ resource_type: 'image' }, (uploadError: any, result: any) => {
                    if (uploadError) {
                        console.error(`Error uploading to Cloudinary: ${uploadError}`);
                        return reject({ statusCode: 500, message: 'Error uploading photo' });
                    }

                    // Resolve with the secure_url upon successful upload
                    resolve(result.secure_url);
                });


                //delete the file on server after uploading
                try {
                    console.log('Deleting temporary file:', inputPath);
                    fs.unlink(inputPath, (unlinkError) => {
                        if (unlinkError) {
                            console.error(`Error deleting file: ${unlinkError}`);
                        } else {
                            console.log('Temporary file deleted successfully');
                        }
                    });
                } catch (unlinkError) {
                    console.error(`Error deleting file: ${unlinkError}`);
                }

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
