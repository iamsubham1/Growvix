import mongoose from 'mongoose';

export const connectToDb = async (MONGODB_URI: string) => {
    try {
        const connection = await mongoose.connect(MONGODB_URI);
        console.log('Connected to database');

        connection.connection.on('open', () => {
            console.log('Connection is open');
        });

        connection.connection.on('error', (err) => {
            console.error('Connection error:', err);
        });
    } catch (error) {
        console.error('Could not connect to database:', error);
    }
};
