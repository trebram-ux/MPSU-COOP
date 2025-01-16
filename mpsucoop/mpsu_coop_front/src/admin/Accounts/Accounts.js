import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepositWithdrawForm from '../DepositWithdrawForm/DepositWithdrawForm';
import { PiHandDepositFill } from 'react-icons/pi';
import { BiMoneyWithdraw } from 'react-icons/bi';
import { FaSearch } from 'react-icons/fa';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [archivedAccounts, setArchivedAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionType, setActionType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshArchives, setRefreshArchives] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/archives/?archive_type=Account')
      .then(response => setArchivedAccounts(response.data || []))
      .catch(error => console.error('Error fetching archived accounts:', error));
  }, [refreshArchives]);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/accounts/');
      setAccounts(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const openForm = (account, type) => {
    if (type === 'withdraw') {
      const confirmFullWithdrawal = window.confirm(
        `Do you want to withdraw the full amount of ${Number(account.shareCapital).toLocaleString()}? 
        Notice: Your Account will be marked Inactive`
      );

      if (!confirmFullWithdrawal) {
        return; // Exit if "No" is selected
      }
    }

    setSelectedAccount({ ...account, fullWithdrawal: type === 'withdraw' ? account.shareCapital : null });
    setActionType(type);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedAccount(null);
    setActionType('');
  };

  const deleteAccount = async (accountNumber, accountData) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this account? This will archive it.');
    if (!confirmDelete) return;
  
    try {
      const archivePayload = {
        archive_type: 'Account',
        archived_data: accountData,
      };
  
      await axios.post('http://localhost:8000/archives/', archivePayload);
      alert('Account successfully archived.');
  
      await axios.delete(`http://localhost:8000/accounts/${accountNumber}/`);
      alert('Account successfully removed from active accounts.');
  
      setAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.account_number !== accountNumber)
      );
  
      triggerRefreshArchivedRecords();
    } catch (err) {
      console.error('Error deleting the account:', err.response || err.message || err);
      alert(`An error occurred: ${err.response?.data?.message || 'Unable to complete the operation. Please try again.'}`);
    }
  };
  
  
  
  const triggerRefreshArchivedRecords = () => {
    setRefreshArchives(!refreshArchives);
  };

  const getAccountHolderName = (member) => {
    if (member && member.first_name && member.middle_name && member.last_name) {
      return `${member.first_name} ${member.middle_name} ${member.last_name}`;
    }
    return 'Account Holder Not Found';
  };

  const filteredAccounts = accounts.filter((account) => {
    const accountNumber = account.account_number.toString();
    const accountHolderName = getAccountHolderName(account.account_holder).toLowerCase();
    return (
      accountNumber.includes(searchQuery.toLowerCase()) ||
      accountHolderName.includes(searchQuery.toLowerCase())
    );
  });

  if (loadingAccounts) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{ width: '99%', padding: '10px' }}>
      <h2 style={{ width: '97%', marginTop: '-10px', padding: '20px', textAlign: 'center', color: 'black', fontSize: '30px' }}>
        ACCOUNTS
      </h2>

      {!showForm && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search Accounts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '7px 40px 10px 10px',
                fontSize: '16px',
                border: '2px solid #000',
                borderRadius: '4px',
                width: '250px',
                marginLeft: '1005px',
                marginBottom: '30px',
                marginTop: '-10px',
              }}
            />
            <button
              style={{
                position: 'absolute',
                top: '-14px',
                fontSize: '12px',
                cursor: 'pointer',
                backgroundColor: '#007bff',
                color: 'black',
                border: '2px solid #000000',
                borderRadius: '4px',
                padding: '10px',
                marginLeft: '1255px',
              }}
            >
              <FaSearch />
            </button>
          </div>

          <div
            style={{
              maxHeight: '460px',
              width: '99%',
              overflowY: 'auto',
              boxShadow: '0px 0px 15px 0px rgb(154, 154, 154)',
              marginTop: '20px',
              padding: '5px',
              borderRadius: '5px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid black', position: 'sticky', top: '-5px', zIndex: '1', fontSize: '20px' }}>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Account Number</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Account Holder</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Share Capital</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.account_number} style={{ textAlign: 'center', fontSize: '20px' }}>
                    <td style={{ padding: '5px', fontSize: '20px' }}>{account.account_number}</td>
                    <td style={{ padding: '5px', fontSize: '20px' }}>{getAccountHolderName(account.account_holder)}</td>
                    <td style={{ padding: '5px', fontSize: '20px' }}>{Number(account.shareCapital).toLocaleString()}</td>
                    <td style={{ padding: '5px', fontSize: '20px' }}>{account.status}</td>
                    <td style={{ padding: '5px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                      {account.status.toLowerCase() === 'active' ? (
                        <>
                          <button
                            onClick={() => openForm(account, 'deposit')}
                            style={{
                              border: '2px solid #000',
                              padding: '5px',
                              cursor: 'pointer',
                              color: 'black',
                              width: '50px',
                            }}
                          >
                            <PiHandDepositFill /> Deposit
                          </button>
                          <button
                            onClick={() => openForm(account, 'withdraw')}
                            style={{
                              border: '2px solid #000',
                              padding: '5px',
                              cursor: 'pointer',
                              color: 'black',
                              width: '60px',
                            }}
                          >
                            <BiMoneyWithdraw /> Withdraw
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => deleteAccount(account.account_number, account)}
                          style={{
                            border: '2px solid #000',
                            padding: '5px',
                            cursor: 'pointer',
                            color: 'black',
                            backgroundColor: 'goldenrod',
                            width: '60px',
                          }}
                        >
                          Move to Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <DepositWithdrawForm
          onClose={closeForm}
          account={selectedAccount}
          actionType={actionType}
          fetchAccounts={fetchAccounts}
          setError={setError}
        />
      )}
    </div>
  );
}

export default Accounts;

