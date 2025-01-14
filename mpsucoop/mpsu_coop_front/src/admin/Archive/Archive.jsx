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
  const [deleting, setDeleting] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    fetchArchivedData();
    fetchAuditTrail();
  }, []);

  const fetchArchivedData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
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
  
      // Filter out deleted members before setting the data
      const deletedMembers = JSON.parse(localStorage.getItem('deletedMembers')) || [];
      setArchivedUsers(membersResponse.data.filter((user) => !deletedMembers.includes(user.id)) || []);
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

  // Update handleDeleteMember function to use archivedUsers and setArchivedUsers
  const handleDeleteMember = async (id) => {
    const memberToDelete = archivedUsers.find((member) => member.memId === id);
    if (!memberToDelete) {
      console.log(`Member with ID ${id} not found.`);
      return;
    }

    try {
      console.log(`Deleting member with ID: ${id}`);
      const response = await axios.delete(`http://localhost:8000/members/${id}/`);
      console.log('Delete response:', response.data); // Make sure the response is as expected
      
      setArchivedUsers(archivedUsers.filter((member) => member.memId !== id)); // This updates the UI
    } catch (err) {
      console.error('Error deleting member:', err.response || err.message || err);
      setError('Error deleting member.');
    }
  };

  const handleDeleteClick = async (memId) => {
    const member = archivedUsers.find((user) => user.id === memId);
    if (!member) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this member?');
    if (!confirmDelete) return;

    try {
      setDeleting(true); // Set loading state
      await handleDeleteMember(memId); // Call delete function

      // Persist the deleted member's ID in local storage
      const deletedMembers = JSON.parse(localStorage.getItem('deletedMembers')) || [];
      localStorage.setItem('deletedMembers', JSON.stringify([...deletedMembers, memId]));

      // Filter out the member from the local state
      setArchivedUsers(archivedUsers.filter((user) => user.id !== memId));

      alert('Member deleted successfully!');
    } catch (error) {
      alert('Failed to delete member. Please try again.');
    } finally {
      setDeleting(false); // Reset loading state
    }
  };

  const handleMultipleDeleteClick = async () => {
    if (selectedMembers.length === 0) {
      alert('No members selected for deletion.');
      return;
    }
  
    const confirmDelete = window.confirm('Are you sure you want to delete the selected members?');
    if (!confirmDelete) return;
  
    try {
      setDeleting(true); // Set loading state
      // Iterate over selected members and delete each one
      await Promise.all(selectedMembers.map(async (memId) => {
        await handleDeleteMember(memId);
        const deletedMembers = JSON.parse(localStorage.getItem('deletedMembers')) || [];
        localStorage.setItem('deletedMembers', JSON.stringify([...deletedMembers, memId]));
      }));
  
      // Filter out deleted members from the state
      setArchivedUsers(archivedUsers.filter((user) => !selectedMembers.includes(user.id)));
      setSelectedMembers([]); // Clear selection
      alert('Selected members deleted successfully!');
    } catch (error) {
      alert('Failed to delete selected members. Please try again.');
    } finally {
      setDeleting(false); // Reset loading state
    }
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers((prevSelectedMembers) => {
      if (prevSelectedMembers.includes(memberId)) {
        return prevSelectedMembers.filter((id) => id !== memberId); // Remove from selection
      } else {
        return [...prevSelectedMembers, memberId]; // Add to selection
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredArchivedUsers.length) {
      setSelectedMembers([]); // Deselect all
    } else {
      setSelectedMembers(filteredArchivedUsers.map((user) => user.id)); // Select all
    }
  };

  const handleRestoreClick = (memId) => {
    // Show confirmation dialog
    setShowRestoreConfirmation(true);
    setSelectedMember(archivedUsers.find((user) => user.id === memId)); // Find the member for confirmation
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

  const deleteAccount = async (account_number) => {
    try {
      const token = localStorage.getItem('authToken');
      console.log(`Deleting account with number: ${account_number}`); // Debugging log
      const response = await axios.delete(`http://localhost:8000/delete-account/${account_number}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response:', response.data); // Log the response data
      alert('Account deleted successfully!');
      fetchArchivedData(); // Refresh data after deletion
    } catch (err) {
      console.error('Error deleting account:', err.response || err);
      if (err.response) {
        alert(`Failed to delete account: ${err.response.data.message || err.response.statusText}`);
      } else {
        alert('Failed to delete account. Please try again later.');
      }
    }
  };
  
  const handleAccountDeleteClick = (accountId) => {
    const account = archivedAccounts.find((account) => account.id === accountId);
    if (
      window.confirm(
        `Are you sure you want to delete the account with number ${account.archived_data.account_number}?`
      )
    ) {
      deleteAccount(account.archived_data.account_number); // Use account_number here
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

  const filteredArchivedUsers = filterData(archivedUsers, ['memId', 'first_name', 'last_name', 'email']);
  const filteredArchivedLoans = filterData(archivedLoans, ['loan_amount', 'status']);
  const filteredArchivedAccounts = filterData(archivedAccounts, ['account_number', 'status']);
  const filteredAuditTrail = filterData(auditTrail, ['action_type', 'description', 'user', 'timestamp']);

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
          <h2 style={{ textAlign: 'center'}}>Archived Members</h2>
          <div style={{ marginBottom: '-15px' }}>
          <button
            onClick={handleMultipleDeleteClick}
            disabled={selectedMembers.length === 0}
            style={{
              backgroundColor: '#ed3a3a',
              color: 'black',
              border: 'none',
              padding: '7px 3px',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '150px'
            }}
          >
            Delete All Selected
          </button>
        </div>
          {/* Table */}
        <table
          className="records-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: '20px 0',
            fontSize: '16px',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid black', textAlign: 'left', width: '50px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                id="selectAllCheckbox"
                type="checkbox"
                onChange={toggleSelectAll} // Select/Deselect All
                checked={
                  selectedMembers.length === filteredArchivedUsers.length &&
                  filteredArchivedUsers.length > 0
                }
              />
              <label htmlFor="selectAllCheckbox">All</label>
            </div>
              </th>
              <th style={{ padding: '12px', border: '1px solid black' }}>Full Name</th>
              <th style={{ padding: '12px', border: '1px solid black' }}>Email</th>
              <th style={{ padding: '12px', border: '1px solid black' }}>Archived At</th>
              <th style={{ padding: '12px', border: '1px solid black' }}>Actions</th>
            </tr>
          </thead>
          
          <tbody>
            {filteredArchivedUsers.length > 0 ? (
              filteredArchivedUsers.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: '12px', border: '1px solid black', textAlign: 'left', width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={() => toggleMemberSelection(user.id)}
                    />
                  </td>
                  <td style={{ padding: '12px', border: '1px solid black' }}>
                    {`${user.archived_data.first_name} ${user.archived_data.last_name}`}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid black' }}>
                    {user.archived_data.email}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid black' }}>
                    {new Date(user.archived_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid black', textAlign: 'center' }}>
                    <button
                      onClick={() => viewTransactions(user)}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'black',
                        border: 'none',
                        padding: '5px 10px',
                        marginRight: '5px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleRestoreClick(user.id)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'black',
                        border: 'none',
                        padding: '5px 10px',
                        marginRight: '5px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'black',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '12px', border: '1px solid black' }}>
                  No archived members found.
                </td>
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
                <th>Account Holder</th>
                <th>Status</th>
                <th>Archived At</th>
                <th>Actions</th> {/* Added a column for actions */}
              </tr>
            </thead>
            <tbody>
              {filteredArchivedAccounts.length > 0 ? (
                filteredArchivedAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.archived_data.account_number}</td>
                    {/* Account Holder will display full name */}
                    <td>
                      {account.archived_data.account_holder.first_name} {account.archived_data.account_holder.middle_name} {account.archived_data.account_holder.last_name}
                    </td>
                    <td>{account.archived_data.status}</td>
                    <td>{new Date(account.archived_at).toLocaleString()}</td>
                    <td>
                      {/* Add buttons for Restore and Delete */}
                      <button onClick={() => handleRestoreClick(account.id)}>Restore</button>
                      <button onClick={() => handleAccountDeleteClick(account.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No archived accounts found.</td> {/* Updated colspan to 5 */}
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
