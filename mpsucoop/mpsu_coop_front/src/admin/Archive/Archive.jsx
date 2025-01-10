import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Archive.css'; // CSS for styling

const ArchivedRecords = () => {
  const [archivedMembers, setArchivedMembers] = useState([]);
  const [archivedLoans, setArchivedLoans] = useState([]);
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

  const filteredArchivedLoans = archivedLoans.filter(loan =>
    loan.archived_data.loan_amount.toString().includes(searchTerm) ||
    loan.archived_data.status.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search Records"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Dropdown for Tabs */}
      <div className="dropdown">
        <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} className="dropdown-select">
          <option value="members">Archived Members</option>
          <option value="accounts">Archived Accounts</option>
          <option value="loans">Archived Loans</option>
          <option value="auditTrail">Audit Trail</option>
        </select>
      </div>

      {/* Tab Content */}
      {activeTab === 'members' && (
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
              {filteredArchivedMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.archived_data.first_name}</td>
                  <td>{member.archived_data.last_name}</td>
                  <td>{member.archived_data.email}</td>
                  <td>{new Date(member.archived_at).toLocaleString()}</td>
                </tr>
              ))}
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
              {filteredArchivedLoans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.archived_data.loan_amount}</td>
                  <td>{loan.archived_data.status}</td>
                  <td>{new Date(loan.archived_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="records-box">
          <h2>Archived Accounts</h2>
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
              {filteredArchivedAccounts.map(account => (
                <tr key={account.id}>
                  <td>{account.archived_data.account_number}</td>
                  <td>{account.archived_data.status}</td>
                  <td>{account.archived_data.shareCapital}</td>
                  <td>{new Date(account.archived_at).toLocaleString()}</td>
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
