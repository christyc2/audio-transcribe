import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './components/AuthProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App /> {/* App component is the root component of the React application - the react page that will be rendered */}
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
