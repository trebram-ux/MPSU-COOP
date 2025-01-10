import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Archive.css';

const ArchivedRecords = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [archivedLoans, setArchivedLoans] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('members'); // Default tab
  const [actionType, setActionType] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    fetchArchivedData();
    fetchAuditTrail();
  }, []);

  const fetchArchivedData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken'); // Update as needed
      const [membersResponse, loansResponse] = await Promise.all([
        axios.get('http://localhost:8000/archives/?archive_type=Member', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:8000/archives/?archive_type=Loan', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setArchivedUsers(membersResponse.data || []);
      setArchivedLoans(loansResponse.data || []);
    } catch (err) {
      console.error('Error fetching archived data:', err);
      setError('Failed to fetch archived data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Update as needed
      const response = await axios.get('http://localhost:8000/audit-logs/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuditTrail(response.data || []);
    } catch (err) {
      console.error('Error fetching audit trail:', err);
      setError('Failed to fetch audit logs.');
    }
  };

  const logAction = async (event) => {
    event.preventDefault();
    if (!actionType || !actionDescription) {
      alert('Both action type and description are required.');
      return;
    }
    try {
      const token = localStorage.getItem('authToken'); // Update as needed
      await axios.post(
        'http://localhost:8000/log-action/',
        { action_type: actionType, description: actionDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Action logged successfully!');
      setActionType('');
      setActionDescription('');
      fetchAuditTrail(); // Refresh logs
    } catch (err) {
      console.error('Error logging action:', err);
      alert('Failed to log action.');
    }
  };

  const filterRecords = (records, keys) =>
    records.filter(record =>
      keys.some(key =>
        record.archived_data[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  return (
    <div className="archived-records">
      <h1 className="title">Archived Records</h1>
      <input
        type="text"
        placeholder="Search Records"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <div className="dropdown">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="dropdown-select"
        >
          <option value="members">Archived Members</option>
          <option value="loans">Archived Loans</option>
          <option value="auditTrail">Audit Trail</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : activeTab === 'members' ? (
        <div className="records-box">
          <h2>Archived Members</h2>
          <table className="records-table">
            <thead>
              <tr>
                <th>Mem ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Archived At</th>
              </tr>
            </thead>
            <tbody>
              {filterRecords(archivedUsers, ['memId', 'first_name', 'last_name', 'email']).length ? (
                filterRecords(archivedUsers, ['memId', 'first_name', 'last_name', 'email']).map(user => (
                  <tr key={user.id}>
                    <td>{user.archived_data.memId}</td>
                    <td>{user.archived_data.first_name}</td>
                    <td>{user.archived_data.last_name}</td>
                    <td>{user.archived_data.email}</td>
                    <td>{new Date(user.archived_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No archived members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'loans' ? (
        <div className="records-box">
          <h2>Archived Loans</h2>
          <table className="records-table">
            <thead>
              <tr>
                <th>Loan Amount</th>
                <th>Status</th>
                <th>Archived At</th>
              </tr>
            </thead>
            <tbody>
              {filterRecords(archivedLoans, ['loan_amount', 'status']).length ? (
                filterRecords(archivedLoans, ['loan_amount', 'status']).map(loan => (
                  <tr key={loan.id}>
                    <td>{loan.archived_data.loan_amount}</td>
                    <td>{loan.archived_data.status}</td>
                    <td>{new Date(loan.archived_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No archived loans found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="records-box">
          <h2>Audit Trail</h2>
          <form onSubmit={logAction} className="log-action-form">
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="dropdown-select"
            >
              <option value="">Select Action Type</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
            <input
              type="text"
              placeholder="Action Description"
              value={actionDescription}
              onChange={(e) => setActionDescription(e.target.value)}
              className="search-bar"
            />
            <button type="submit" className="submit-button">Log Action</button>
          </form>
          <table className="records-table">
            <thead>
              <tr>
                <th>Action Type</th>
                <th>Description</th>
                <th>User</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditTrail.length ? (
                auditTrail.map(log => (
                  <tr key={log.id}>
                    <td>{log.action_type}</td>
                    <td>{log.description}</td>
                    <td>{log.user}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No audit trail logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArchivedRecords;
