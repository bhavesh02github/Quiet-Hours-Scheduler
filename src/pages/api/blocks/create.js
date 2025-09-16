// pages/api/blocks/create.js
import clientPromise from '../../../lib/mongodb';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
    // --- THIS IS THE MISSING LINE ---
    const token = req.headers.authorization?.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { title, startTime, endTime } = req.body;
        const client = await clientPromise;
        const db = client.db('quiet_hours_db');

        const newBlock = {
            userId: user.id,
            userEmail: user.email,
            title,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            reminderSent: false,
            createdAt: new Date(),
        };

        const result = await db.collection('timeBlocks').insertOne(newBlock);
        res.status(201).json(result);
    } catch (e) {
        console.error("Error creating block:", e);
        res.status(500).json({ message: 'Something went wrong', error: e.message });
    }
}