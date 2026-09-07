import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Roster from './pages/Roster';
import Register from './pages/Register';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/roster/:eventId" element={<Roster />} />
          <Route path="/register/:eventId" element={<Register />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
