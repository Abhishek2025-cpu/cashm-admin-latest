import React, { useEffect, useState } from "react";
import axios from "axios";
import SideMenu from "./SideMenu";
import { Margin } from "@mui/icons-material";
import Lottie from "react-lottie";
import loaderAnimation from "../assets/loader.json"; // Loader animation

const Request = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data on load
useEffect(() => {
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        "https://api.cashamsalone.com/admin/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setRequests(response.data);
    } catch (err) {
      setError("Failed to fetch data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchRequests();
}, []);


  // Approve request handler
 const handleApprove = async (id) => {
  try {
    const token = localStorage.getItem("adminToken");

    const url = `https://api.cashamsalone.com/admin/approve/${id}`;

    await axios.put(url, null, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id
          ? { ...request, approved: true, approvedAt: new Date().toISOString() }
          : request
      )
    );
  } catch (err) {
    setError("Failed to approve request: " + err.message);
  }
};

  // Filter requests based on search query
  const filteredRequests = requests.filter((request) =>
    request.updatedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.updatedFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.amount.toString().includes(searchQuery)
  );

  if (loading)
    return (
      <div style={styles.center}>
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
    );

  if (error)
    return (
      <p style={styles.errorText}>
        {error}
      </p>
    );

  return (
    <>
    
        <SideMenu />
    <div style={styles.container}>
      <h1 style={styles.header}>Requests Details</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search requests..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchBar}
      />

      {/* Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeaderCell}>Updated By</th>
              <th style={styles.tableHeaderCell}>Updated For</th>
              <th style={styles.tableHeaderCell}>Amount</th>
              <th style={styles.tableHeaderCell}>Updated At</th>
              <th style={styles.tableHeaderCell}>Approved At</th>
              <th style={styles.tableHeaderCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request, index) => (
              <tr
                key={request.id}
                style={{
                  ...styles.tableRow,
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                }}
              >
                <td style={styles.tableCell}>{request.updatedBy}</td>
                <td style={styles.tableCell}>{request.updatedFor}</td>
                <td style={styles.tableCell}>
                  <span style={styles.chip}>${request.amount}</span>
                </td>
                <td style={styles.tableCell}>
                  {new Date(request.updatedAt).toLocaleDateString()}
                </td>
                <td style={styles.tableCell}>
                  {request.approvedAt
                    ? new Date(request.approvedAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td style={styles.tableCell}>
                  <button
                    style={{
                      ...styles.button,
                      backgroundColor: request.approved ? "#28a745" : "#007bff",
                      cursor: request.approved ? "not-allowed" : "pointer",
                    }}
                    onClick={() => handleApprove(request.id)}
                    disabled={request.approved}
                  >
                    {request.approved ? "Approved" : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

// Inline Styles
const styles = {
  container: {
    Margin: "0",
    width: "1200px",
  
  },
  header: {
    textAlign: "center",
    color: "#333",
    fontSize: "24px",
  },
  searchBar: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  tableContainer: {
    
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#198754", // Success color
    color: "#fff",
  },
  tableHeaderCell: {
    padding: "10px",
    textAlign: "left",
    fontWeight: "bold",
  },
  tableRow: {
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  tableCell: {
    padding: "10px",
    border: "1px solid #ddd",
  },
  chip: {
    display: "inline-block",
    padding: "5px 10px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "15px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  button: {
    padding: "8px 16px",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  loadingText: {
    fontSize: "18px",
    color: "#555",
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
  },
};

export default Request;
