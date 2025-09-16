// pages/index.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function Home() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await signIn({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    }
  };

  return (
    <div className="container">
      <h1>Quiet Hours Scheduler</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {/* Add a signup form or link as needed */}
    </div>
  );
}