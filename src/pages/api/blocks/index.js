// pages/api/blocks/index.js
import clientPromise from '../../../lib/mongodb';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json([]); // Return empty array on wrong method
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json([]); // Return empty array on auth error
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json([]); // Return empty array on auth error
  }

  try {
    const client = await clientPromise;
    const db = client.db('quiet_hours_db');
    const blocks = await db.collection('timeBlocks')
      .find({ userId: user.id })
      .sort({ startTime: 1 })
      .toArray();
      
    res.status(200).json(blocks);
  } catch (e) {
    console.error("Failed to fetch blocks:", e);
    // On server error, still return an empty array so the frontend doesn't crash
    res.status(500).json([]); 
  }
}