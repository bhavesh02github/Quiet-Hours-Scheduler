// pages/api/blocks/create.js
import clientPromise from '../../../lib/mongodb';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { title, startTime, endTime } = req.body;
    const client = await clientPromise;
    const db = client.db('quiet_hours_db');

    // Check if the user already exists in our users collection
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ userId: user.id });

    // If the user doesn't exist, create a new document for them
    if (!existingUser) {
        await usersCollection.insertOne({
            userId: user.id,
            name: user.user_metadata.full_name,
            email: user.email,
        });
    }
    
    // Now proceed with creating the new time block
    const newBlock = {
      userId: user.id,
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reminderSent: false,
      createdAt: new Date(),
    };

    const result = await db.collection('timeBlocks').insertOne(newBlock);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
}