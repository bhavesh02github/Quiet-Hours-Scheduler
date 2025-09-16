// pages/_app.js
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css'; // Make sure to create this file for basic styling

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster />
    </AuthProvider>
  );
}

export default MyApp;