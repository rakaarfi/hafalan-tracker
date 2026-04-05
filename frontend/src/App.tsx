import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 border-x border-border">
        <Routes>
          <Route path="/" element={<div>Landing Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />

          {/* Protected Routes */}
          <Route path="/teacher/*" element={<div>Teacher Dashboard</div>} />
          <Route path="/parent/*" element={<div>Parent Dashboard</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
