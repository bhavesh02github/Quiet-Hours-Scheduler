// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { formatInTimeZone } from 'date-fns-tz';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [blocks, setBlocks] = useState([]);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');

  // Fetch blocks for the user
  const fetchBlocks = async () => {
    if (!user) return;
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/blocks', {
        headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setBlocks(data);
  };

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      fetchBlocks();
    }
  }, [user, router]);

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Default duration to 1 hour
    const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

    const res = await fetch('/api/blocks/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ title, startTime, endTime }),
    });

    if (res.ok) {
      toast.success('Block created!');
      setTitle('');
      setStartTime('');
      fetchBlocks(); // Refresh the list
    } else {
      toast.error('Failed to create block.');
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <h2>Welcome, {user.email}</h2>
      <button onClick={signOut}>Logout</button>

      <h3>Create a New Quiet Block</h3>
      <form onSubmit={handleCreateBlock}>
        <input
          type="text"
          placeholder="What will you focus on?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <button type="submit">Create Block</button>
      </form>

      <h3>Your Upcoming Blocks</h3>
      <ul>
        {blocks.length > 0 ? (
          blocks.map((block) => (
            <li key={block._id}>
              <strong>{block.title}</strong> - {formatInTimeZone(new Date(block.startTime), 'Asia/Kolkata', "MMM d, yyyy 'at' h:mm a")}
            </li>
          ))
        ) : (
          <p>You have no upcoming quiet blocks.</p>
        )}
      </ul>
    </div>
  );
}