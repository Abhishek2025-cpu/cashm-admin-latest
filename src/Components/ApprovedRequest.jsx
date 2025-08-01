import React, { useEffect, useState } from "react";
import axios from "axios";
import Lottie from "react-lottie";
import loaderAnimation from "../assets/loader.json"; // Loader animation
import SideMenu from "./SideMenu";

const ApprovedRequest = () => {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch approved requests
  useEffect(() => {
    const fetchApprovedRequests = async () => {
      try {
        const response = await axios.get(
          "https://api.cashamsalone.com/admin/approved-requests",
          {
            headers: {
              Authorization: "Basic UGVhcmw6UGVhcmxQcm9kQ2hlY2tlckAxMjM5MA==",
              "Content-Type": "application/json",
            },
          }
        );

        setApprovedRequests(response.data);
      } catch (err) {
        if (!navigator.onLine) {
          setError("Network is not connected"); // Handle no internet connection
        } else {
          setError("Failed to fetch data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedRequests();
  }, []);

  // Filter requests based on search query
  const filteredRequests = approvedRequests.filter((request) =>
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
      <p style={styles.errorText}>{error}</p>
    );

  return (
    <>
    <SideMenu />
   
    <div style={styles.container}>
      <h1 style={styles.header}>Approved Requests</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search approved requests..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchBar}
      />

      {/* Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeaderCell}>Agent</th>
              <th style={styles.tableHeaderCell}>Client No.</th>
              <th style={styles.tableHeaderCell}>Amount</th>
              <th style={styles.tableHeaderCell}>Date</th>
              <th style={styles.tableHeaderCell}>Approved Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => (
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={styles.noDataText}>
                  No data found
                </td>
              </tr>
            )}
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
    padding: "20px",
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
    overflowX: "auto",
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#198754", // Success color for header
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
  noDataText: {
    textAlign: "center",
    padding: "20px",
    fontSize: "16px",
    color: "#555",
  },
};

export default ApprovedRequest;
