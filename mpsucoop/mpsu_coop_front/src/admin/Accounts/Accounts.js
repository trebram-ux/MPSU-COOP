import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Accounts.css';
import DepositWithdrawForm from '../DepositWithdrawForm/DepositWithdrawForm';
import { PiHandDepositFill } from 'react-icons/pi';
import { BiMoneyWithdraw } from 'react-icons/bi';
import { FaSearch } from 'react-icons/fa';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionType, setActionType] = useState('');
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAccounts();
    fetchMembers();
  }, []);

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

  const fetchMembers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/members/');
      setMembers(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleDeleteAccount = async (account_number) => {
    try {
      await axios.delete(`http://localhost:8000/accounts/${account_number}/`);
      setAccounts(accounts.filter((account) => account.account_number !== account_number));
    } catch (err) {
      setError(err);
    }
  };

  const openForm = (account, type) => {
    setSelectedAccount(account);
    setActionType(type);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedAccount(null);
    setActionType('');
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

  if (loadingAccounts || loadingMembers) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{ width: '99%', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2
          style={{
            padding: '20px',
            textAlign: 'center',
            borderBottom: '2px solid #000000',
            color: 'black',
            width: '100%',
          }}
        >
          ACCOUNTS
        </h2>
      </div>

      <div
        className={styles.searchBar}
        style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
      >
        <input
          type="text"
          placeholder="Search Accounts"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '7px 40px 10px 10px',
            fontSize: '16px',
            border: '2px solid #000000',
            borderRadius: '4px',
            width: '200px',
            marginLeft: '1050px',
            marginBottom: '50px',
            marginTop: '-10px',
          }}
        />
        <button
          onClick={() => console.log('Search triggered')}
          style={{
            position: 'absolute',
            marginTop: '-55px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'black',
            border: '2px solid #000000',
            borderRadius: '4px',
            padding: '10px',
            marginLeft: '1250px',
          }}
        >
          <FaSearch />
        </button>
      </div>

      {!showForm && (
        <div
          style={{
            maxHeight: '450px',
            overflowY: 'auto',
            border: '2px solid black',
            marginTop: '-10px',
            padding: '5px',
            borderRadius: '5px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid black',
                  position: 'sticky',
                  top: '-5px',
                  zIndex: '1',
                }}
              >
                <th style={{ padding: '10px', textAlign: 'center' }}>Account Number</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Account Holder</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Share Capital</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.account_number} style={{ textAlign: 'center', fontSize: '16px' }}>
                  <td style={{ padding: '5px', fontSize: '16px' }}>{account.account_number}</td>
                  <td style={{ padding: '5px', fontSize: '16px' }}>
                    {getAccountHolderName(account.account_holder)}
                  </td>
                  <td style={{ padding: '5px', fontSize: '16px' }}>
                    {Number(account.shareCapital).toLocaleString()} {/* Format with 2 decimal places */}
                  </td>
                  <td style={{ padding: '5px', fontSize: '16px' }}>{account.status}</td>
                  <td
                    style={{
                      padding: '5px',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
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
                      <strong>
                        <PiHandDepositFill /> Deposit
                      </strong>
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
                      <strong>
                        <BiMoneyWithdraw /> Withdraw
                      </strong>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && actionType !== 'add' && (
        <DepositWithdrawForm
          onClose={closeForm}
          account={selectedAccount}
          actionType={actionType}
          fetchAccounts={fetchAccounts}
          setError={setError}
          className={styles.formWrapper}
        />
      )}
    </div>
  );
}

export default Accounts;
