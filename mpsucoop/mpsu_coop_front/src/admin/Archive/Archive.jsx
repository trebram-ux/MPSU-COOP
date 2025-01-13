import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Archive.css'; // Assuming you'll use a separate CSS file for better styling management

const ArchivedRecords = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [archivedLoans, setArchivedLoans] = useState([]);
  const [archivedAccounts, setArchivedAccounts] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // Default to members
  const [actionType, setActionType] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null); // Selected member for transactions
  const [showRestoreConfirmation, setShowRestoreConfirmation] = useState(false); // Flag for confirmation

  useEffect(() => {
    fetchArchivedData();
    fetchAuditTrail();
  }, []);

  const fetchArchivedData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken'); // Update as needed
      const [membersResponse, loansResponse, accountsResponse] = await Promise.all([
        axios.get('http://localhost:8000/archives/?archive_type=Member', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:8000/archives/?archive_type=Loan', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:8000/archives/?archive_type=Account', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setArchivedUsers(membersResponse.data || []);
      setArchivedLoans(loansResponse.data || []);
      setArchivedAccounts(accountsResponse.data || []);
    } catch (err) {
      console.error('Error fetching archived data:', err);
      setError('Failed to fetch archived data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const token = localStorage.getItem('authToken');
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
      const token = localStorage.getItem('authToken');
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

  const restoreMember = async (memberId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:8000/restore-member/${memberId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Member restored successfully!');
      setShowRestoreConfirmation(false); // Close confirmation dialog
      fetchArchivedData(); // Refresh data after restoring
    } catch (err) {
      console.error('Error restoring member:', err);
      alert('Failed to restore member.');
    }
  };

  const deleteMember = async (memberId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:8000/delete-member/${memberId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response:', response.data);
      alert('Member deleted successfully!');
      fetchArchivedData(); // Refresh data after deletion
    } catch (err) {
      console.error('Error deleting member:', err.response || err);
      if (err.response) {
        // Provide a more specific error message
        alert(`Failed to delete member: ${err.response.data.error || err.response.statusText}`);
      } else {
        alert('Failed to delete member. Please try again later.');
      }
    }
  };
  
  const handleRestoreClick = (memberId) => {
    // Show confirmation dialog
    setShowRestoreConfirmation(true);
    setSelectedMember(archivedUsers.find((user) => user.id === memberId)); // Find the member for confirmation
  };

  const handleDeleteClick = (memberId) => {
    const member = archivedUsers.find((user) => user.id === memberId);
    if (
      window.confirm(
        `Are you sure you want to delete ${member.archived_data.first_name} ${member.archived_data.last_name}?`
      )
    ) {
      deleteMember(memberId);
    }
  };

  const handleCancelRestore = () => {
    // Close confirmation dialog without restoring
    setShowRestoreConfirmation(false);
  };

  const viewTransactions = async (member) => {
    setSelectedMember(member);
    setLoading(true); // Show a loading indicator while fetching data
    try {
      const token = localStorage.getItem('authToken');
      const [accountsResponse, loansResponse, paymentsResponse] = await Promise.all([
        axios.get(`http://localhost:8000/member-accounts/${member.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:8000/member-loans/${member.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:8000/member-payments/${member.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      // Attach the fetched details to the selected member
      setSelectedMember({
        ...member,
        accounts: accountsResponse.data,
        loans: loansResponse.data,
        payments: paymentsResponse.data,
      });
      setActiveTab('transactions'); // Switch to transactions tab
    } catch (err) {
      console.error('Error fetching member details:', err);
      alert('Failed to fetch member details. Please try again.');
    } finally {
      setLoading(false);
    }
  };  

  // Filter logic for search term
  const filterData = (data, keys) => {
    return data.filter((item) =>
      keys.some((key) =>
        item.archived_data[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Filtered records based on search term
  const filteredArchivedUsers = filterData(archivedUsers, [
    'memId',
    'first_name',
    'last_name',
    'email',
  ]);
  const filteredArchivedLoans = filterData(archivedLoans, ['loan_amount', 'status']);
  const filteredArchivedAccounts = filterData(archivedAccounts, ['account_number', 'status']);
  const filteredAuditTrail = filterData(auditTrail, [
    'action_type',
    'description',
    'user',
    'timestamp',
  ]);

  // Filtered transactions for the selected member
  const filteredTransactions = selectedMember
    ? [
        ...filteredArchivedLoans.filter(
          (loan) => loan.archived_data.member_id === selectedMember.archived_data.memId
        ),
        ...filteredArchivedAccounts.filter(
          (account) => account.archived_data.member_id === selectedMember.archived_data.memId
        ),
        ...filteredAuditTrail.filter(
          (log) => log.user === selectedMember.archived_data.first_name
        ),
      ]
    : [];

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
          <option value="accounts">Archived Accounts</option>
          <option value="loans">Archived Loans</option>
          <option value="auditTrail">Audit Trail</option>
          {selectedMember && <option value="transactions">Member Transactions</option>}
        </select>
      </div>

      {/* Display based on activeTab */}
      {activeTab === 'members' && (
        <div className="records-box">
          <h2>Archived Members</h2>
          <table className="records-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Archived At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchivedUsers.length > 0 ? (
                filteredArchivedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{`${user.archived_data.first_name} ${user.archived_data.last_name}`}</td>
                    <td>{user.archived_data.email}</td>
                    <td>{new Date(user.archived_at).toLocaleString()}</td>
                    <td>
                      <button onClick={() => viewTransactions(user)}>View</button>
                      <button onClick={() => handleRestoreClick(user.id)}>Restore</button>
                      <button onClick={() => handleDeleteClick(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No archived members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'transactions' && selectedMember && (
        <div className="records-box">
          <h2>Transactions for {`${selectedMember.archived_data.first_name} ${selectedMember.archived_data.last_name}`}</h2>
          <table className="records-table">
            <thead>
              <tr>
                <th>Transaction Type</th>
                <th>Details</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.archived_data.transaction_type}</td>
                    <td>{transaction.archived_data.details}</td>
                    <td>{transaction.archived_data.amount}</td>
                    <td>{transaction.archived_data.status}</td>
                    <td>{new Date(transaction.archived_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No transactions found for this member.</td>
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

      {activeTab === 'accounts' && (
        <div className="records-box">
          <h2>Archived Accounts</h2>
          <table className="records-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Status</th>
                <th>Archived At</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchivedAccounts.length > 0 ? (
                filteredArchivedAccounts.map(account => (
                  <tr key={account.id}>
                    <td>{account.archived_data.account_number}</td>
                    <td>{account.archived_data.status}</td>
                    <td>{new Date(account.archived_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No archived accounts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'auditTrail' && (
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

      {showRestoreConfirmation && (
        <div className="confirmation-dialog">
          <p>Are you sure you want to restore this member?</p>
          <button onClick={() => restoreMember(selectedMember.id)} className="confirm-button">Yes</button>
          <button onClick={handleCancelRestore} className="cancel-button">No</button>
        </div>
      )}
    </div>
  );
};

export default ArchivedRecords;
