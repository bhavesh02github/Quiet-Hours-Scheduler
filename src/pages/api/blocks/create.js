// pages/api/blocks/create.js
import clientPromise from '../../../lib/mongodb';
import { supabase } from '../../../lib/supabaseClient';
import { zonedTimeToUtc } from 'date-fns-tz';

export default async function handler(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { title, startTime } = req.body;
        const client = await clientPromise;
        const db = client.db('quiet_hours_db');

        const userTimeZone = 'Asia/Kolkata';
        
        const utcStartTime = zonedTimeToUtc(startTime, userTimeZone);
        const utcEndTime = new Date(utcStartTime.getTime() + 60 * 60 * 1000);

        const newBlock = {
            userId: user.id,
            userEmail: user.email,
            title,
            startTime: utcStartTime,
            endTime: utcEndTime,
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