import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AdminLogin from './Components/AdminLogin'
import Dashboard from './Components/Dashboard'
import Request from './Components/Request'
import ApprovedRequest from './Components/ApprovedRequest'
import AddAgent from './Components/AddAgent'
import AddBalance from './Components/AddBalace'
import EventsTable from './Components/Events'

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
const RequireAuth = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
      
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
         <Route
          path="/admin/Requests"
          element={
            <RequireAuth>
              <Request/>
            </RequireAuth>
          }
         />
          <Route
          path="/admin/approved-requests"
          element={
            <RequireAuth>
              <ApprovedRequest/>
            </RequireAuth>
          }
         />
           <Route
          path="/admin/add-agents"
          element={
            <RequireAuth>
              <AddAgent/>
            </RequireAuth>
          }
         />
          <Route
          path="/admin/add-balance"
          element={
            <RequireAuth>
              <AddBalance/>
            </RequireAuth>
          }
         /> 
          <Route
          path="/admin/events"
          element={
            <EventsTable/>
          }
      />

        
          <Route path="/" element={<Navigate to="/admin/login" />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
