import * as mongoose from 'mongoose'

export interface NotificationModel extends mongoose.Document {

}

export const notificationSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Types.ObjectId,
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
