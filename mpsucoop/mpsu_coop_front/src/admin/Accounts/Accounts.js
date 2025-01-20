import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepositWithdrawForm from '../DepositWithdrawForm/DepositWithdrawForm';
import { PiHandDepositFill } from 'react-icons/pi';
import { BiMoneyWithdraw } from 'react-icons/bi';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [archivedAccounts, setArchivedAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState(null);  // General error state
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionType, setActionType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshArchives, setRefreshArchives] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const formatNumber = (number) => {
    if (number == null || isNaN(number)) return "N/A";
    return new Intl.NumberFormat('en-US').format(number);
  };

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
      setError(err);  // Set general error message here
    } finally {
      setLoadingAccounts(false);
    }
  };

  const openForm = (account, type) => {
    if (type === 'withdraw') {
      setModalContent({
        message: `Do you want to withdraw the full amount of ${Number(account.shareCapital).toLocaleString()}? 
        Notice: Your Account will be marked Inactive`,
        onConfirm: () => {
          setSelectedAccount({ ...account, fullWithdrawal: account.shareCapital });
          setActionType(type);
          setShowForm(true);
          closeModal();
        },
      });
      setShowModal(true);
    } else {
      setSelectedAccount(account);
      setActionType(type);
      setShowForm(true);
    }
  };

  const handleDepositWithdrawErrors = (error) => {
    if (actionType === 'deposit') {
      if (error.response && error.response.data) {
        if (error.response.data.amount < 50000) {
          return 'The deposit amount must be at least 50,000.';
        } else if (error.response.data.amount > 1000000) {
          return 'Deposits over 1,000,000 are not allowed.';
        }
      }
      return 'Deposits must be between 50,000 and 1,000,000.';
    } 
    else if (actionType === 'withdraw') {
      if (error.response && error.response.data) {
        return 'No share capital available to be withdrawn.';
      }
      return 'You have No Share Capital amount to withdraw.';
    }
    
    return 'An unexpected error occurred.';
  };
  
  const openArchiveConfirmation = (account) => {
    setModalContent({
      message: `Are you sure you want to move this account to archive? This action will remove the account from active records.`,
      onConfirm: () => {
        archiveAccount(account);
        closeModal();
      },
    });
    setShowModal(true);
  };

  const archiveAccount = async (account) => {
    try {
      const archivePayload = {
        archive_type: 'Account',
        archived_data: account,
      };

      // Archive the account
      await axios.post('http://localhost:8000/archives/', archivePayload);

      // Then delete the account from the active list on the server
      await axios.delete(`http://localhost:8000/accounts/${account.account_number}/`);

      alert('Account successfully archived.');

      // Update the active accounts list by removing the archived account locally
      setAccounts(prevAccounts => prevAccounts.filter(acc => acc.account_number !== account.account_number));

      // Optionally, refresh the list of archived accounts
      setRefreshArchives(!refreshArchives);

    } catch (err) {
      console.error('Error archiving the account:', err.response || err.message || err);
      alert(`An error occurred: ${err.response?.data?.message || 'Unable to complete the operation. Please try again.'}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedAccount(null);
    setActionType('');
  };

  const Modal = ({ isOpen, content }) => {
    if (!isOpen || !content) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{content.title}</h2>
          <p>{content.message}</p>
          <button onClick={content.onConfirm}>Yes</button>
          <button onClick={closeModal}>No</button>
        </div>
      </div>
    );
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
    const errorMessage = handleDepositWithdrawErrors(error);
    return <div style={{ fontSize: '30px' }}>{errorMessage}</div>;  // Display different error messages here
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
                border: '0px',
                borderRadius: '4px',
                width: '250px',
                marginLeft: '1035px',
                marginBottom: '30px',
                marginTop: '-10px',
              }}
            />
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
                <tr style={{ borderBottom: '1px solid black', position: 'sticky', top: '-5px', zIndex: '1', fontSize: '20px' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Account Number</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Account Holder</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Share Capital</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.account_number} style={{ textAlign: 'left', fontSize: '20px' }}>
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
                              border: '0px',
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
                              border: '0px',
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
                          onClick={() => openArchiveConfirmation(account)}
                          style={{
                            border: '0px',
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
          setError={setError}  // Corrected: Pass setError to the form
        />
      )}

      <Modal isOpen={showModal} content={modalContent} />
    </div>
  );
}

export default Accounts;
