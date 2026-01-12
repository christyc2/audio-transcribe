import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@radix-ui/themes/styles.css';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './components/AuthProvider';
import { Theme } from "@radix-ui/themes";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Theme>
          <App /> {/* App component is the root component of the React application - the react page that will be rendered */}
        </Theme>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
