// context/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthChange = async (event, session) => {
      if (session) {
        // Fetch the user data again to get the latest metadata
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        setUser(updatedUser || null);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Initial check for a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(null, session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    signUp: async ({ email, password, name }) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (!error && data?.user) {
        await supabase.auth.updateUser({ data: { full_name: name } });
      }
      return { data, error };
    },
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};