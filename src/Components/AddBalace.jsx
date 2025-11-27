import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import "./AddBalance.css";
import SideMenu from "./SideMenu";

const API_BASE_URL = "https://api.cashamsalone.com";

const AddBalance = () => {
  const [openForm, setOpenForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [apiResults, setApiResults] = useState([]);
  const [showApiDropdown, setShowApiDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const phoneInputRef = useRef(null);
  const apiCallTimeout = useRef(null);

  // Fetch history on mount
useEffect(() => {
  const token = localStorage.getItem("adminToken");

  axios
    .get(`${API_BASE_URL}/admin/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => setHistory(res.data))
    .catch(() => console.error("Failed to fetch history"));
}, []);


  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        phoneInputRef.current &&
        !phoneInputRef.current.contains(event.target)
      ) {
        setShowApiDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced API call on phoneNumber change with minimum length check
useEffect(() => {
  if (phoneNumber.length < 3) {
    setApiResults([]);
    setUserInfo(null);
    setShowApiDropdown(false);
    return;
  }

  if (apiCallTimeout.current) {
    clearTimeout(apiCallTimeout.current);
  }

  apiCallTimeout.current = setTimeout(() => {
    const token = localStorage.getItem("adminToken");

    axios
      .get(
        `${API_BASE_URL}/admin/user?num=${encodeURIComponent(phoneNumber)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log("API response data:", res.data);

        const user = res.data;
        if (user && user.phoneNumber) {
          setApiResults([user]);
          setShowApiDropdown(true);
        } else {
          setApiResults([]);
          setShowApiDropdown(false);
        }

        setUserInfo(null);
      })
      .catch((err) => {
        console.error("API call failed:", err);
        setApiResults([]);
        setShowApiDropdown(false);
        setUserInfo(null);
      });
  }, 300);

  return () => {
    if (apiCallTimeout.current) {
      clearTimeout(apiCallTimeout.current);
    }
  };
}, [phoneNumber]);





  const handleSelectNumber = (selected) => {
    setPhoneNumber(selected.phoneNumber);
    setUserInfo({
      userName: selected.userName || selected.name || "Unknown User",
      phoneNumber: selected.phoneNumber,
      email: selected.email || "N/A",
    });
    setShowApiDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!phoneNumber) {
      setError("Please enter a phone number.");
      return;
    }
    if (!amount) {
      setError("Please enter an amount.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("amount", amount);

      await axios.post(`${API_BASE_URL}/admin/addBalance`, formData, {
        headers: {
          Authorization: "Basic " + btoa("Pearl:PearlProdChecker@12390"),
        },
      });

      setSuccess("Balance added successfully!");
      setRows((prev) => [
        {
          phoneNumber: phoneNumber,
          amount,
          date: new Date().toLocaleString(),
          recipientName: userInfo ? userInfo.userName : "Manually Added",
          type: "Add",
        },
        ...prev,
      ]);
      setPhoneNumber("");
      setAmount("");
      setUserInfo(null);
      setOpenForm(false);
      setApiResults([]);
      setShowApiDropdown(false);
    } catch (err) {
      setError("Failed to add balance.");
    }
  };

  const paginatedHistory = history
    .filter((h) => h.phoneNumber.includes(searchTerm))
    .slice(page * 25, page * 25 + 25);

  return (
    <>
      <SideMenu />

      <div className="container full-width">
        <div className="top-bar">
          <input
            className="search-input"
            placeholder="Search by number in history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="toggle-btn"
            onClick={() => {
              setOpenForm(!openForm);
              setError("");
              setSuccess("");
              setPhoneNumber("");
              setAmount("");
              setUserInfo(null);
              setApiResults([]);
              setShowApiDropdown(false);
            }}
          >
            {openForm ? "Close Form" : "Add Balance"}
          </button>
        </div>

        {openForm && (
          <div className="form-container">
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}
            <form onSubmit={handleSubmit}>
              <label>
                Phone Number:
                <div className="phone-input-wrapper" ref={dropdownRef}>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    onFocus={() => {
                      if (apiResults.length > 0) setShowApiDropdown(true);
                    }}
                    required
                    placeholder="Enter phone number"
                    ref={phoneInputRef}
                    autoComplete="off"
                  />
                  {showApiDropdown && apiResults.length > 0 && (
                    <ul className="dropdown-list">
                      {apiResults.map((result, index) => (
                        <li
                          key={index}
                          onClick={() => handleSelectNumber(result)}
                          style={{ cursor: "pointer" }}
                          tabIndex={-1}
                        >
                          {result.phoneNumber}{" "}
                          {result.name && `- ${result.name}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </label>

              {userInfo && (
                <div className="user-info">
                  Recipient: {userInfo.userName} (Selected from API)
                </div>
              )}
              {!userInfo && phoneNumber && !showApiDropdown && (
                <div className="user-info no-user">
                  No recipient automatically found. Please ensure the number is
                  correct.
                </div>
              )}

              <label>
                Amount:
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="Enter amount"
                />
              </label>
              <button className="submit-btn" type="submit">
                Submit
              </button>
            </form>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Phone Number</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`new-${index}`} className="new-row">
                  <td>{row.phoneNumber}</td>
                  <td>{row.recipientName}</td>
                  <td>{row.amount}</td>
                  <td>{row.type}</td>
                  <td>{row.date}</td>
                </tr>
              ))}
              {paginatedHistory.map((h) => (
                <tr key={h.id}>
                  <td>{h.phoneNumber}</td>
                  <td>{h.recipientName}</td>
                  <td>{h.amount}</td>
                  <td>{h.type}</td>
                  <td>{h.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            <span>Page {page + 1}</span>
            <button
              disabled={(page + 1) * 25 >= history.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBalance;