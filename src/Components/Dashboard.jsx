import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Container, Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import SideMenu from './SideMenu';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [users, setUsers] = useState([]); // current page users for Table
  const [tableLoading, setTableLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50; 

  const [searchQuery, setSearchQuery] = useState('');
  const iframeRef = useRef(null);

  // Statistics State
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
  });

  // Chart Data State
  const [roleData, setRoleData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      borderWidth: 1,
    }]
  });

  const token = localStorage.getItem('adminToken');

  // 1. Fetch Paginated Data for Table (Updates on page change)
  useEffect(() => {
    setTableLoading(true);
    axios.get(`https://api.cashamsalone.com/admin/allUsers?page=${page}&size=${pageSize}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      withCredentials: true,
    })
    .then(response => {
      const data = response.data;
      const userList = Array.isArray(data.users) ? data.users : [];
      
      setUsers(userList);
      setTotalPages(data.totalPages || 1);
      
      // Update quick stats from API root
      setStats({
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0
      });
      
      setTableLoading(false);
    })
    .catch(error => { 
      console.error("Error fetching table users:", error); 
      setTableLoading(false); 
    });
  }, [page, token]);

  // 2. Fetch ALL Data for Graph using Batching (Fixes 999 count issue)
  useEffect(() => {
    const fetchAllUsersForGraph = async () => {
      setGraphLoading(true);
      const batchSize = 1000; // Safe size per request
      let allUsersAccumulated = [];

      try {
        // Step 1: Fetch first batch to get Total Count
        const firstResponse = await axios.get(`https://api.cashamsalone.com/admin/allUsers?page=1&size=${batchSize}`, { 
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
          withCredentials: true,
        });

        const data = firstResponse.data;
        const totalRecords = data.totalUsers || 0;
        const firstBatch = Array.isArray(data.users) ? data.users : (Array.isArray(data.content) ? data.content : []);
        
        allUsersAccumulated = [...firstBatch];

        // Step 2: If there are more users than the first batch, fetch the rest
        if (totalRecords > allUsersAccumulated.length) {
          const totalPagesNeeded = Math.ceil(totalRecords / batchSize);
          const promises = [];

          // Create requests for page 2, 3, etc.
          for (let p = 2; p <= totalPagesNeeded; p++) {
             promises.push(
               axios.get(`https://api.cashamsalone.com/admin/allUsers?page=${p}&size=${batchSize}`, { 
                 headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                 withCredentials: true,
               })
             );
          }

          // Execute all requests in parallel
          const results = await Promise.all(promises);
          
          results.forEach(res => {
            const batchUsers = res.data.users || res.data.content || [];
            allUsersAccumulated = [...allUsersAccumulated, ...batchUsers];
          });
        }

        // Step 3: Process the complete dataset
        if (allUsersAccumulated.length > 0) {
          const rolesCount = allUsersAccumulated.reduce((acc, user) => {  
            const roleName = user.role ? user.role.toUpperCase() : 'UNKNOWN';
            acc[roleName] = (acc[roleName] || 0) + 1;  
            return acc;  
          }, {});  

          setRoleData({  
            labels: Object.keys(rolesCount),  
            datasets: [{ 
              data: Object.values(rolesCount), 
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
              hoverOffset: 4
            }]  
          });
        }

      } catch (error) {
        console.error("Error calculating graph stats:", error);
      } finally {
        setGraphLoading(false);
      }
    };

    fetchAllUsersForGraph();
  }, [token]);

  const handlePrint = () => {
    const content = document.getElementById('printable-table').outerHTML;
    const iframe = iframeRef.current.contentWindow;
    iframe.document.open();
    iframe.document.write(`<!DOCTYPE html><html><head><title>Print Table</title><style>table {width:100%;border-collapse:collapse;} th, td {border:1px solid #ddd; padding:8px;} th {background-color:#4CAF50; color:white;}</style></head><body>${content}</body></html>`);
    iframe.document.close();
    iframe.focus();
    iframe.print();
  };

  const filteredUsers = users.filter(user =>
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRowStyle = role => {
    switch(role?.toLowerCase()) {
      case 'admin': return { backgroundColor: '#f8d7da' };
      case 'agent': return { backgroundColor: '#d1ecf1' };
      case 'user': return { backgroundColor: '#d4edda' };
      default: return {};
    }
  };

  return (
    <>
      <SideMenu />
      <div className="dashboard-container">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          
          {/* Top Section: Graph and Stats */}  
          <Box mb={4} display="flex" justifyContent="center" flexWrap="wrap" alignItems="center" gap={4}>  
            
            {/* Chart Section */}
            <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 350, height: 400 }}>
              <Typography variant="h6" mb={2} fontWeight="bold">User Roles Distribution</Typography>  
              <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {graphLoading ? (
                  <Box textAlign="center">
                    <CircularProgress color="success" />
                    <Typography variant="caption" display="block" mt={1}>Calculating stats...</Typography>
                  </Box>
                ) : roleData.labels.length > 0 ? (
                  <Doughnut 
                    data={roleData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }} 
                  />
                ) : (
                  <Typography color="textSecondary">No data available</Typography>
                )}
              </Box>
            </Paper>

            {/* Stats Cards */}
            <Box display="flex" flexDirection="column" gap={3}>
              <Paper elevation={3} sx={{ p: 4, minWidth: 250, textAlign: 'center', borderRadius: 2 }}>  
                <Typography variant="h6" color="textSecondary">Total Users</Typography>  
                <Typography variant="h3" color="primary" fontWeight="bold">{stats.totalUsers}</Typography>  
              </Paper>  

              <Paper elevation={3} sx={{ p: 4, minWidth: 250, textAlign: 'center', borderRadius: 2 }}>  
                <Typography variant="h6" color="textSecondary">Active Users</Typography>  
                <Typography variant="h3" color="success.main" fontWeight="bold">{stats.activeUsers}</Typography>  
              </Paper> 
            </Box> 

          </Box>  

          {/* Table Section */}  
          <Paper elevation={2} sx={{ p: 2, overflow: 'hidden' }}>
            <Box className="table-container" id="printable-table" style={{ overflowX:'auto' }}>  
              <table className="data-table" style={{ borderCollapse:'collapse', width:'100%' }}>  
                <thead>  
                  <tr style={{ backgroundColor:'#4CAF50', color:'#fff', height: '50px' }}>  
                    <th style={{ padding: '10px' }}>SR No</th>
                    <th style={{ padding: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Search page..." 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        style={{ width:'95%', padding:'8px', borderRadius:'4px', border:'none', outline: 'none', color: 'black'}}
                      />
                    </th>  
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th>State</th>
                    <th>Verified</th>  
                  </tr>  
                </thead>  
                <tbody>  
                  {tableLoading ? (
                     <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}><CircularProgress size={24} /> Loading...</td></tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u, index) => (
                      <tr key={u.id || index} style={{ ...getRowStyle(u.role), borderBottom: '1px solid #eee' }}>  
                        <td style={{ padding: '10px' }}>{(page - 1) * pageSize + index + 1}</td>
                        <td style={{ padding: '10px' }}>{u.name}</td>
                        <td style={{ padding: '10px' }}>{u.email || 'N/A'}</td>
                        <td style={{ padding: '10px' }}>{u.phoneNumber}</td>
                        <td style={{ padding: '10px' }}>{u.role}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: u.state ? 'green' : 'red' }}>
                          {u.state ? 'Active' : 'Inactive'}
                        </td>
                        <td style={{ padding: '10px' }}>{u.verified ? 'Yes' : 'No'}</td>  
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No users found.</td>
                    </tr>
                  )}
                </tbody>  
              </table>  
            </Box>  

            {/* Pagination Controls */}  
            <Box display="flex" justifyContent="center" alignItems="center" mt={3} gap={2} pb={2}>  
              <Button 
                variant="contained" 
                color="primary" 
                disabled={page <= 1 || tableLoading} 
                onClick={() => setPage(prev => prev - 1)}
              >
                Previous
              </Button>  
              
              <Typography variant="body1" fontWeight="bold">
                Page {page} of {totalPages}
              </Typography>  
              
              <Button 
                variant="contained" 
                color="primary" 
                disabled={page >= totalPages || tableLoading} 
                onClick={() => setPage(prev => prev + 1)}
              >
                Next
              </Button>  
            </Box>  
          </Paper>

          <iframe ref={iframeRef} style={{ display:'none' }} title="print-frame"/>  
        </Container>  
      </div>  
    </>  
  );
}