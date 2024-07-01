import * as mongoose from 'mongoose';

export interface RoleModel extends mongoose.Document {
    name: string;
};


const roleSchema = new mongoose.Schema({
    name: { type: String }

}, {
    collection: 'Roles',
    timestamps: true
});

export const RoleSchema = mongoose.model<RoleModel>('Role', roleSchema);