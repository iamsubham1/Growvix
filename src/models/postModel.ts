import * as mongoose from 'mongoose';

export interface PostModel extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    content: {
        text?: string;
        image?: string;
        videoDetails?: string;
    };
    scheduledTime: Date;
    status: string;
    platform: string;

}

const contentSchema = new mongoose.Schema({
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    videoDetails: {
        type: String,
    },
});

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'Admin'
    },
    content: { type: contentSchema },
    scheduledTime: { type: Date },
    status: {
        type: String,
        enum: ['SCHEDULED', 'POSTED', 'FAILED']
    },
    platform: {
        type: String,
        enum: ['FACEBOOK', 'INSTAGRAM', 'GOOGLE', 'LINKEDIN', 'REDDIT']
    }
}, {
    collection: 'posts',
    timestamps: true,
})


export const PostSchema = mongoose.model<PostModel>('Post', postSchema);