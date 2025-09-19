import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import "./AddBalance.css";
import SideMenu from "./SideMenu";

const API_BASE_URL = "https://api.cashamsalone.com";

const AddBalance = () => {
  const [openForm, setOpenForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [userInfo, setUserInfo] = useState(null); // Keep userInfo state for manual display
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dropdownRef = useRef(null); // Still needed for related numbers from history
  const phoneInputRef = useRef(null); // Still needed for related numbers from history

  // fetch history from API on mount
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/admin/history`, {
        headers: {
          Authorization: "Basic " + btoa("Pearl:PearlProdChecker@12390"),
        },
      })
      .then((res) => setHistory(res.data))
      .catch(() => console.error("Failed to fetch history"));
  }, []);

  // Removed fetchUserInfo and related useEffects for automatic lookup
  // The admin will now manually enter the phone number and recipient name.

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          phoneInputRef.current && !phoneInputRef.current.contains(event.target)) {
        // No need to hide dropdown based on user info lookup, only for history suggestions
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const relatedNumbersFromHistory = useMemo(() => {
    if (phoneNumber.length < 2) return [];
    const uniqueNumbers = new Set();
    const results = [];
    history.forEach(item => {
      if (item.phoneNumber.includes(phoneNumber) && !uniqueNumbers.has(item.phoneNumber)) {
        uniqueNumbers.add(item.phoneNumber);
        results.push({
          phoneNumber: item.phoneNumber,
          userName: item.recipientName || "Unknown User"
        });
      }
    });
    return results;
  }, [phoneNumber, history]);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    // No automatic user info lookup, so no need to set showDropdown based on it
  };

  const handleSelectNumber = (selectedNumber) => {
    setPhoneNumber(selectedNumber.phoneNumber);
    // When selecting from history, we can populate userInfo for display purposes if desired,
    // but it won't be used for API lookup.
    setUserInfo({
      userName: selectedNumber.userName,
      phoneNumber: selectedNumber.phoneNumber,
      email: "N/A" // Since we don't fetch, we can set a placeholder
    });
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
      // If you still want to send recipientName to the API, you'd need to add a separate input for it.
      // For now, we'll assume the API infers recipient from phoneNumber or doesn't need it.

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
          recipientName: userInfo ? userInfo.userName : "Manually Added", // Use userInfo if available from history select
          type: "Add"
        },
        ...prev,
      ]);
      setPhoneNumber("");
      setAmount("");
      setUserInfo(null); // Clear userInfo after submission
      setOpenForm(false);
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
                  onFocus={() => phoneNumber.length >= 2 && relatedNumbersFromHistory.length > 0 && true /* always show dropdown if conditions met */}
                  required
                  placeholder="Enter phone number"
                  ref={phoneInputRef}
                />
                {phoneNumber.length >= 2 && relatedNumbersFromHistory.length > 0 && ( // Display dropdown if phone number is long enough and suggestions exist
                  <ul className="dropdown-list">
                    {relatedNumbersFromHistory.map((result, index) => (
                      <li key={index} onClick={() => handleSelectNumber(result)}>
                        {result.phoneNumber} {result.userName !== "Unknown User" && ` - ${result.userName}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </label>

            {/* Displaying userInfo if it's set (e.g., from history selection) */}
            {userInfo && (
              <div className="user-info">
                Recipient: {userInfo.userName} (Selected from history)
              </div>
            )}
            {!userInfo && phoneNumber && ( // Message if no user info is explicitly set (meaning not from history selection)
                <div className="user-info no-user">
                    No recipient automatically found. Please ensure the number is correct.
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
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
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