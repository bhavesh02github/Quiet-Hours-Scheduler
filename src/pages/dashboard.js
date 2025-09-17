// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [blocks, setBlocks] = useState([]);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const userName = user?.user_metadata?.full_name || user?.email;

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
    const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

    const newBlock = { title, startTime, endTime, _id: Date.now() };
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    setTitle('');
    setStartTime('');
    
    toast.promise(
      fetch('/api/blocks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, startTime, endTime }),
      }),
      {
        loading: 'Creating your quiet block...',
        success: 'Block created!',
        error: (err) => {
          setBlocks(prevBlocks => prevBlocks.filter(block => block._id !== newBlock._id));
          return 'Failed to create block.';
        },
      }
    );
  };
  
  const handleDeleteBlock = async (blockId) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    toast.promise(
      fetch(`/api/blocks/delete?id=${blockId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }),
      {
        loading: 'Deleting block...',
        success: (response) => {
          setBlocks(blocks.filter(block => block._id !== blockId));
          return 'Block deleted successfully!';
        },
        error: (err) => {
          return 'Failed to delete block.';
        },
      }
    );
  };

  if (!user) return null;

  return (
    <div className="main-container">
      <div className="glass-card dashboard-header-card">
        <h2>Welcome, {userName}</h2>
        <button onClick={signOut} className="btn-danger">
          Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card dashboard-form-card">
          <h3 style={{ textAlign: 'center' }}>Create a New Quiet Block</h3>
          <form onSubmit={handleCreateBlock}>
            <div className="form-group">
              <input
                type="text"
                placeholder="What will you focus on?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', maxWidth: 'none' }}>
              Create Block
            </button>
          </form>
        </div>

        <div className="glass-card dashboard-list-card">
          <h3 style={{ textAlign: 'center' }}>Your Upcoming Blocks</h3>
          <ul className="list-container">
            {blocks.length > 0 ? (
              blocks.map((block) => (
                <li key={block._id} className="list-item">
                  <div className="list-item-content">
                    <strong>{block.title}</strong>
                    <span>{format(new Date(block.startTime), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteBlock(block._id)} 
                    className="delete-button"
                  >
                    Delete
                  </button>
                </li>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>You have no upcoming quiet blocks.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}