import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Chat from './components/Chat.jsx'
import Signup from './components/Signup.jsx'
import Login from './components/Login.jsx'

function getAccessToken() {
  try {
    const session = JSON.parse(localStorage.getItem('session'))
    return session?.access_token || null
  } catch {
    return null
  }
}

function Navbar({ isAuthenticated, onLogout }) {
  return (
    <nav className="bg-white shadow border border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to={isAuthenticated ? "/chat" : "/"} className="text-2xl font-bold text-blue-600 hover:text-blue-700">
          DocQnA
        </Link>
        <div>
          {!isAuthenticated ? (
            <>
              <Link
                to="/signup"
                className="mr-4 px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition"
              >
                Signup
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/chat"
                className="mr-4 px-4 py-2 rounded font-semibold text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition"
              >
                Chat
              </Link>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function App() {
  const navigate = useNavigate()
  const [_, setForceUpdate] = useState(0) // for re-render

  const isAuthenticated = !!getAccessToken()

  const handleLogin = () => {
    setForceUpdate(x => x + 1) // force re-render
    navigate('/chat')
  }

  const handleLogout = () => {
    localStorage.removeItem('session')
    setForceUpdate(x => x + 1) // force re-render
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <main className="">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/chat" /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/chat" /> : <Signup onSignup={handleLogin} />
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/chat" /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? <Chat /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  )
}
