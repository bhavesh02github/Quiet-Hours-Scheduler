// pages/api/blocks/delete.js
import clientPromise from '../../../lib/mongodb';
import { supabase } from '../../../lib/supabaseClient';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'Block ID is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('quiet_hours_db');
    const collection = db.collection('timeBlocks');

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId: user.id // Ensures a user can only delete their own blocks
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Block not found or you do not have permission to delete it.' });
    }

    res.status(200).json({ message: 'Block deleted successfully.' });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
}