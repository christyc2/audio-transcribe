import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { RequireAuth } from './components/RequireAuth';
import { Dashboard } from './components/Dashboard';
import { NavBar } from './components/NavBar';

// js function used to create React components
function App() {

  // the returned JSX is what is rendered to the screen
  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, #404040 100%)' }}>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* RequireAuth checks if the user is authenticated (blocks unauthenticated access) */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes> 
    </div>
  );
}

export default App;
