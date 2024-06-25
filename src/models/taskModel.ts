import * as mongoose from 'mongoose';

export interface TaskModel extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    startDate: Date;
    endDate: Date;
    status: 'ONGOING' | 'COMPLETED';
    posts: {
        title: string;
        description: string;
        date: Date;
    }[];
}

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    }
});

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['ONGOING', 'COMPLETED'],
        },
        posts: {
            type: [postSchema],
            required: true,
        },
    },
    {
        collection: 'tasks',
        timestamps: true,
    },
);

export const TaskSchema = mongoose.model<TaskModel>('Task', taskSchema);
