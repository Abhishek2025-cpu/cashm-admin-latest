import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import loaderAnimation from "../assets/loader.json"; // Adjust the path to your loader.json
import SideMenu from "./SideMenu";

const AddAgent = () => {
  const [tokens, setTokens] = useState([]);
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState({
    role: "USER",
    phoneNumber: "",
    email: "",
    name: "",
    address: "",
    admintoken: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({}); // Track form errors

  const authHeaders = {
    Authorization: "Basic " + btoa("Pearl:PearlProdChecker@12390"),
  };

  // Fetch tokens on mount
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch("https://api.cashamsalone.com/admin/gettokens", { headers: authHeaders });
        const data = await res.json();
        setTokens(data);
      } catch (err) {
        setError("Failed to fetch tokens.");
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, []);

  const createToken = async () => {
    if (!email) {
      alert("Email is required!");
      return;
    }

    try {
      const res = await fetch(`https://api.cashamsalone.com/admin/generatetoken?mail=${email}`, {
        method: "GET",
        headers: authHeaders,
      });
      const data = await res.json();
      alert("Token Created: " + data.token);
    } catch (err) {
      setError("Error creating token.");
    }
  };

  const addUser = async () => {
    // Form Validation
    const errors = {};
    if (!userData.name) errors.name = "Name is required";
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = "Valid email is required";
    }
    if (!userData.phoneNumber || userData.phoneNumber.length < 10) {
      errors.phoneNumber = "Phone number must be at least 10 digits";
    }
    if (userData.role === "AGENT" && !userData.admintoken) {
      errors.admintoken = "Admin token is required for agents";
    }
    if (userData.role === "MERCHANT" && !userData.address) {
      errors.address = "Address is required for merchants";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const formData = new FormData();
    formData.append("role", userData.role);
    formData.append("phoneNumber", userData.phoneNumber);
    formData.append("email", userData.email);
    formData.append("name", userData.name);
    if (userData.role === "AGENT") formData.append("admintoken", userData.admintoken);
    if (userData.role === "MERCHANT") formData.append("address", userData.address);

    try {
      const res = await fetch("https://api.cashamsalone.com/admin/addUser", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      const data = await res.json();
      alert("User added successfully!");
    } catch (err) {
      setError("Error adding user.");
    }
  };

  const deleteToken = async (tokenId) => {
    try {
      await fetch(`https://api.cashamsalone.com/admin/deletetoken?Id=${tokenId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      setTokens(tokens.filter((t) => t.id !== tokenId));
    } catch (err) {
      setError("Error deleting token.");
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: loaderAnimation,
            rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
          }}
          height={150}
          width={150}
        />
      </div>
    );
  }

  return (
    <>
    <SideMenu />
  
    <div style={styles.container}>
      <h1 style={styles.header}>Add Agents Merchents & Users Here </h1>

      {/* Create Token Section */}
      <div style={styles.section}>
        <h2 style={styles.subHeader}>Create Token for Admin</h2>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <button style={styles.button} onClick={createToken}>
          Generate Token
        </button>
      </div>

      {/* Add User Section */}
      <div style={styles.section}>
        <h2 style={styles.subHeader}>Add Role</h2>
        <input
          type="text"
          placeholder="Name"
          value={userData.name}
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          style={styles.input}
        />
        {formErrors.name && <p style={styles.errorText}>{formErrors.name}</p>}

        <input
          type="email"
          placeholder="Email"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          style={styles.input}
        />
        {formErrors.email && <p style={styles.errorText}>{formErrors.email}</p>}

        <input
          type="text"
          placeholder="Phone Number"
          value={userData.phoneNumber}
          onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
          style={styles.input}
        />
        {formErrors.phoneNumber && <p style={styles.errorText}>{formErrors.phoneNumber}</p>}

        <select
          value={userData.role}
          onChange={(e) => setUserData({ ...userData, role: e.target.value })}
          style={styles.select}
        >
          <option value="USER">USER</option>
          <option value="AGENT">AGENT</option>
          <option value="MERCHANT">MERCHANT</option>
        </select>

        {userData.role === "AGENT" && (
          <>
            <select
              value={userData.admintoken}
              onChange={(e) => setUserData({ ...userData, admintoken: e.target.value })}
              style={styles.select}
            >
              <option value="">Select Admin Email</option>
              {tokens.map((token) => (
                <option key={token.id} value={token.token}>
                  {token.email}
                </option>
              ))}
            </select>
            {formErrors.admintoken && <p style={styles.errorText}>{formErrors.admintoken}</p>}
          </>
        )}

        {userData.role === "MERCHANT" && (
          <>
            <input
              type="text"
              placeholder="Address"
              value={userData.address}
              onChange={(e) => setUserData({ ...userData, address: e.target.value })}
              style={styles.input}
            />
            {formErrors.address && <p style={styles.errorText}>{formErrors.address}</p>}
          </>
        )}

        <button style={styles.button} onClick={addUser}>
          Add Role
        </button>
      </div>

      {/* Existing Tokens Section */}
      <div style={styles.section}>
        <h2 style={styles.subHeader}>Existing Admin's Emails</h2>
        <ul style={styles.tokenList}>
          {tokens.map((token) => (
            <li key={token.id} style={styles.tokenItem}>
              {token.email}
              <button style={styles.deleteButton} onClick={() => deleteToken(token.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
};

export default AddAgent;

const styles = {
    container: {
      padding: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center",
      color: "#333",
    
      fontSize: "24px",
      fontWeight: "bold",
    },
    section: {
      marginBottom: "40px",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "5px",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    subHeader: {
      marginBottom: "20px",
      fontSize: "20px",
      color: "#555",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "14px",
    },
    select: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "14px",
    },
    button: {
      padding: "10px 20px",
      backgroundColor: "#198754", // Success green
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "14px",
      transition: "background-color 0.3s ease",
    },
    buttonHover: {
      backgroundColor: "#145a32",
    },
    deleteButton: {
      padding: "5px 10px",
      backgroundColor: "#dc3545", // Danger red
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "12px",
      transition: "background-color 0.3s ease",
    },
    deleteButtonHover: {
      backgroundColor: "#a71d2a",
    },
    tokenList: {
      listStyleType: "none",
      padding: "0",
      margin: "0",
    },
    tokenItem: {
      padding: "10px",
      borderBottom: "1px solid #ddd",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    errorText: {
      color: "red",
      fontSize: "12px",
      marginTop: "-10px",
      marginBottom: "15px",
    },
    center: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    },
  };
  