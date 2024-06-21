import { Request, Response } from 'express';
const multer = require('multer')
const sharp = require('sharp');
import cloudinary from '../configuration/cloudinaryConfig'; // Assuming you have a valid Cloudinary configuration
import fs from 'fs';
import { Readable } from 'stream';

const upload = multer({ dest: 'uploads/' })
const cloudinaryUploader = cloudinary.uploader;

const uploadImage = async (req: Request, res: Response, userId: string) => {
    console.log("entered");
    try {
        upload.single('image')(req, res, async (err: any) => {
            if (err) {
                console.error('Multer error', err);
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ message: 'File size exceeds the limit' });
                    }
                    return res.status(500).json({ message: 'Multer error: ' + err.message });
                } else {
                    return res.status(500).json({ message: 'Internal server error: ' + err.message });
                }
            }

            try {
                const inputPath = req.file?.path;
                if (!inputPath) {
                    return res.status(400).json({ message: 'No file uploaded' });
                }

                console.log('Upload started');
                const transformedImageBuffer = await sharp(inputPath)
                    .resize(300, 300)
                    .toFormat('jpeg')
                    .rotate(0)
                    .toBuffer();

                console.log('Image processing complete. Uploading to Cloudinary...');
                const uploadStream = cloudinaryUploader.upload_stream({ resource_type: 'image' }, async (uploadError: any, result: any) => {
                    if (uploadError) {
                        console.error(`Error uploading to Cloudinary: ${uploadError}`);
                        return res.status(500).json({ message: 'Error uploading photo' });
                    }

                    console.log('Upload to Cloudinary successful.');

                    // Delete temporary file after a successful upload
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

                    // Respond with success
                    return res.status(201).json({ message: 'Photo uploaded successfully', url: result.secure_url });
                });

                // Pipe the transformedImageBuffer directly to the uploadStream
                const transformedImageStream = new Readable();
                transformedImageStream.push(transformedImageBuffer);
                transformedImageStream.push(null);
                transformedImageStream.pipe(uploadStream);

            } catch (error) {
                console.error('Error handling photo upload:', error);
                res.status(500).json({ message: 'Error handling photo upload' });
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error handling photo upload' });
    }
};

export default uploadImage;
