import React, { useState, useEffect } from 'react';
import axios from 'axios';
<<<<<<< HEAD
import './Archive.css'; // CSS for styling
=======
import './Archive.css';
>>>>>>> 20182c3357d703bac6a7f66f92d77d423d3c307c

const ArchivedRecords = () => {
  const [archivedMembers, setArchivedMembers] = useState([]);
  const [archivedLoans, setArchivedLoans] = useState([]);
<<<<<<< HEAD
  const [archivedAccounts, setArchivedAccounts] = useState([]);  // <-- Fix this
  const [auditTrail, setAuditTrail] = useState([]);              // <-- Ensure this is correctly initialized
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    axios.get('http://localhost:8000/archives/?archive_type=Member')
      .then(response => setArchivedMembers(response.data || []))
      .catch(error => console.error('Error fetching archived members:', error));

    axios.get('http://localhost:8000/archives/?archive_type=Loan')
      .then(response => setArchivedLoans(response.data || []))
      .catch(error => console.error('Error fetching archived loans:', error));

    axios.get('http://localhost:8000/archives/?archive_type=Account')
      .then(response => setArchivedAccounts(response.data || []))  // <-- Ensure this is working
      .catch(error => console.error('Error fetching archived accounts:', error));

    axios.get('http://localhost:8000/api/audit-trail/')
      .then(response => setAuditTrail(response.data || []))
      .catch(error => console.error('Error fetching audit trail:', error));
  }, []);

  // Filter functions for each tab
  const filteredArchivedMembers = archivedMembers.filter(member =>
    member.archived_data.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.archived_data.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.archived_data.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
=======
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
>>>>>>> 20182c3357d703bac6a7f66f92d77d423d3c307c

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

  const filteredArchivedAccounts = archivedAccounts.filter(account =>
    account.archived_data.account_number.toString().includes(searchTerm) ||
    account.archived_data.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuditTrail = auditTrail.filter(log =>
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(log.timestamp).toLocaleString().includes(searchTerm)
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
<<<<<<< HEAD

      {/* Dropdown for Tabs */}
      <div className="dropdown">
        <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} className="dropdown-select">
=======
      <div className="dropdown">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="dropdown-select"
        >
>>>>>>> 20182c3357d703bac6a7f66f92d77d423d3c307c
          <option value="members">Archived Members</option>
          <option value="accounts">Archived Accounts</option>
          <option value="loans">Archived Loans</option>
          <option value="auditTrail">Audit Trail</option>
        </select>
      </div>

<<<<<<< HEAD
      {/* Tab Content */}
      {activeTab === 'members' && (
=======
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : activeTab === 'members' ? (
>>>>>>> 20182c3357d703bac6a7f66f92d77d423d3c307c
        <div className="records-box">
          <h2>Archived Members</h2>
          <table className="records-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Archived At</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {filteredArchivedMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.archived_data.first_name}</td>
                  <td>{member.archived_data.last_name}</td>
                  <td>{member.archived_data.email}</td>
                  <td>{new Date(member.archived_at).toLocaleString()}</td>
=======
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
>>>>>>> 20182c3357d703bac6a7f66f92d77d423d3c307c
                </tr>
              ))}
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
<<<<<<< HEAD
              {filteredArchivedLoans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.archived_data.loan_amount}</td>
                  <td>{loan.archived_data.status}</td>
                  <td>{new Date(loan.archived_at).toLocaleString()}</td>
=======
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
>>>>>>> 20182c3357d703bac6a7f66f92d77d423d3c307c
                </tr>
              ))}
            </tbody>
          </table>
        </div>
<<<<<<< HEAD
      )}

      {activeTab === 'accounts' && (
        <div className="records-box">
          <h2>Archived Accounts</h2>
=======
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
>>>>>>> 20182c3357d703bac6a7f66f92d77d423d3c307c
          <table className="records-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Status</th>
                <th>Share Capital</th>
                <th>Archived At</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {filteredArchivedAccounts.map(account => (
                <tr key={account.id}>
                  <td>{account.archived_data.account_number}</td>
                  <td>{account.archived_data.status}</td>
                  <td>{account.archived_data.shareCapital}</td>
                  <td>{new Date(account.archived_at).toLocaleString()}</td>
=======
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
>>>>>>> 20182c3357d703bac6a7f66f92d77d423d3c307c
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    {activeTab === 'auditTrail' && (
            <div className="records-box">
              <h2>Audit Trail</h2>
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
                  {filteredAuditTrail.length > 0 ? (
                    filteredAuditTrail.map(log => (
                      <tr key={log.id}>
                        <td>{log.action_type}</td>
                        <td>{log.description}</td>
                        <td>{log.user}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No audit logs found.</td>
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
