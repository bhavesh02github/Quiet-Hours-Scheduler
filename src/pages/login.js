// pages/index.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function Home() {
  const { user, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      const { data, error } = await signUp({ email, password, name });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email to confirm your account!');
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully!');
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="main-container">
      <div className="glass-card">
        <h1 className="auth-title text-gradient">Quiet Hours Scheduler</h1>
        <h2 className="auth-subtitle">{isSignUp ? 'Create Your Account' : 'Welcome Back!'}</h2>
        
        <form onSubmit={handleAuth}>
          <div className="form-group">
            <input
              id="email"
              type="email"
              placeholder="Your Valid Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {isSignUp && (
            <div className="form-group">
              <input
                id="fullName"
                type="text"
                placeholder="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="button-container mt-4">
            <button type="submit" className="btn-primary">
              {isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </form>
        
        <p className="text-center mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button className="btn-link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? ' Log In' : ' Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}