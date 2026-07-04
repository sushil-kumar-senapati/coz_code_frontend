import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SubmitIssue from './pages/SubmitIssue';
import CitizenDashboard from './pages/CitizenDashboard';
import MpDashboard from './pages/MpDashboard';
import './i18n';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-layout">
            <Navbar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/submit" element={<SubmitIssue />} />
                <Route path="/dashboard" element={<CitizenDashboard />} />
                <Route path="/mp-dashboard" element={<MpDashboard />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
