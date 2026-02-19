import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Watch from './pages/Watch.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import Navbar from './components/Navbar.jsx'
import CategoryVideos from "./pages/CategoryVideos.jsx";


function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/watch/:category"element={<ProtectedRoute><CategoryVideos /></ProtectedRoute>
  }
/>

      </Routes>
    </Router>
  )
}

export default App
