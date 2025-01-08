import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Archive.css';  // Assuming you'll use a separate CSS file for better styling management

const ArchivedRecords = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [archivedLoans, setArchivedLoans] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('members');  // Default to members

  useEffect(() => {
    // Fetch archived members
    axios.get('http://localhost:8000/archives/?archive_type=Member')
      .then(response => setArchivedUsers(response.data || []))
      .catch(error => console.error('Error fetching archived members:', error));

    // Fetch archived loans
    axios.get('http://localhost:8000/archives/?archive_type=Loan')
      .then(response => setArchivedLoans(response.data || []))
      .catch(error => console.error('Error fetching archived loans:', error));

    // Fetch audit trail
    axios.get('http://localhost:8000/api/audit-trail/')
      .then(response => setAuditTrail(response.data || []))
      .catch(error => console.error('Error fetching audit trail:', error));
  }, []);

  // Filter audit trail, archived members, and loans based on search term
  const filteredAuditTrail = auditTrail.filter(log =>
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArchivedUsers = archivedUsers.filter(user =>
    user.archived_data.memId.toString().includes(searchTerm) ||
    user.archived_data.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.archived_data.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.archived_data.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArchivedLoans = archivedLoans.filter(loan =>
    loan.archived_data.loan_amount.toString().includes(searchTerm) ||
    loan.archived_data.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="archived-records">
      <h1 className="title">Archived Records</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search Records"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Dropdown to Switch Tabs */}
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

      {/* Display based on activeTab */}
      {activeTab === 'members' && (
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
              {filteredArchivedUsers.length > 0 ? (
                filteredArchivedUsers.map(user => (
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
      )}

      {activeTab === 'loans' && (
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
              {filteredArchivedLoans.length > 0 ? (
                filteredArchivedLoans.map(loan => (
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
