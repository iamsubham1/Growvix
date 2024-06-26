import * as mongoose from 'mongoose'

export interface NotificationModel extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    list: object[];
    address: string;

}

export const notificationSchema = new mongoose.Schema<NotificationModel>({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    list: {
        type: [{
            message: { type: String },
            notify_at: { type: Date }
        }]
    },
    address: { type: String }


}, {
    collection: 'notification',
    timestamps: true,
})


export const Notification = mongoose.model<NotificationModel>('Notificaton', notificationSchema);
