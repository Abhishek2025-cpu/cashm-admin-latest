import React, { useState, useRef, useEffect } from 'react';
import { CSVLink } from "react-csv";
import axios from "axios";
import Lottie from "react-lottie";
import loaderAnimation from "../assets/loader.json"; // Loader animation
import { Container, Box, Typography } from '@mui/material';
import { ClipLoader } from "react-spinners";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import SideMenu from './SideMenu';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering
  const iframeRef = useRef(null);

  // State for graph data
  const [roleData, setRoleData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    }]
  });

  useEffect(() => {
    axios.get('https://api.cashamsalone.com/admin/allUsers', {
      headers: {
        'Authorization': 'Basic ' + btoa('Pearl:PearlProdChecker@12390'),
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      withCredentials: true,
    })
      .then((response) => {
        setUsers(response.data);

        // Prepare role-based data for the graph
        const rolesCount = response.data.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        setRoleData({
          labels: Object.keys(rolesCount),
          datasets: [{
            data: Object.values(rolesCount),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Custom colors
          }]
        });

        setLoading(false);
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    const content = document.getElementById('printable-table').outerHTML;
    const iframe = iframeRef.current.contentWindow;
    iframe.document.open();
    iframe.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Table</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #4CAF50; color: white; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `);
    iframe.document.close();
    iframe.focus();
    iframe.print();
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRowStyle = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return { backgroundColor: "#f8d7da" }; // Light Red for Admin
      case "agent":
        return { backgroundColor: "#d1ecf1" }; // Light Blue for Agent
      case "user":
        return { backgroundColor: "#d4edda" }; // Light Green for User
      default:
        return {};
    }
  };

  return (
    <>
      <SideMenu />
      <div className="dashboard-container">
        <Container maxWidth="xl">
          {/* Charts Section */}
          <Box mb={4} display="flex" justifyContent="space-between" flexWrap="wrap" alignItems="center">
            {/* Doughnut Chart */}
            <Box sx={{ width: 300, height: 300 }}>
              <Typography variant="h6" mb={2} textAlign="center">
                User Roles Distribution
              </Typography>
              {loading ? (
                <div className="loader-container">
                    <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: loaderAnimation,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice",
            },
          }}
          height={150}
          width={150}
        />
                </div>
              ) : (
                <Doughnut data={roleData} />
              )}
            </Box>

            {/* Additional Statistics */}
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{users.length}</Typography>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
              <Typography variant="h6">Verified Users</Typography>
              <Typography variant="h4">
                {users.filter(user => user.verified).length} (
                {Math.round((users.filter(user => user.verified).length / users.length) * 100)}%)
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
              <Typography variant="h6">Active Users</Typography>
              <Typography variant="h4">
                {users.filter(user => user.state).length}
              </Typography>
            </Box>
          </Box>

          {/* Table Section */}
          <Box className="table-container" id="printable-table" style={{ overflowX: 'auto' }}>
            <table
              className="data-table"
              style={{
                borderCollapse: 'collapse',
                width: '100%',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#4CAF50', color: '#fff' }}>
                  <th>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '90%',
                        padding: '5px',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                      }}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>State</th>
                  <th>Verified</th>
                  <th>Last Location</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={getRowStyle(user.role)}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.role}</td>
                    <td>{user.state ? 'Active' : 'Inactive'}</td>
                    <td>{user.verified ? 'Yes' : 'No'}</td>
                    <td>{user.last_location}</td>
                    <td>{new Date(user.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
          <iframe ref={iframeRef} style={{ display: 'none' }} title="print-frame" />
        </Container>
      </div>
    </>
  );
}
