// pages/api/blocks/index.js
import clientPromise from '../../../lib/mongodb';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
    const client = await clientPromise;
    const db = client.db('quiet_hours_db'); // Or your database name
    const blocks = await db.collection('timeBlocks')
      .find({ userId: user.id })
      .sort({ startTime: 1 })
      .toArray();
      
    res.status(200).json(blocks);
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
}