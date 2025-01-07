import React, { useState } from 'react';
import axios from 'axios';

function DepositWithdrawForm({ account, actionType, onClose, fetchAccounts, setError }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = actionType === 'deposit' 
        ? `http://localhost:8000/accounts/${account.account_number}/deposit/`
        : `http://localhost:8000/accounts/${account.account_number}/withdraw/`;

      await axios.post(endpoint, { amount });
      fetchAccounts(); 
      onClose();
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    }
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    border: '2px solid black',
    borderRadius: '8px',
  };

  const inputStyle = {
    padding: '10px',
    margin: '10px 0',
    border: '2px solid black',
    borderRadius: '4px',
    fontSize: '16px',
  };

  const buttonStyle = {
    padding: '10px',
    margin: '10px 5px',
    backgroundColor: '#007BFF',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: '1', 
  };

  const cancelButtonStyle = {
    backgroundColor: '#6c757d',
  };

  const headerStyle = {
    color: 'black',
    textAlign: 'center',
    marginBottom: '30px',
    marginTop: '30px'
  };

  const buttonContainerStyle = {
    display: 'flex', 
    justifyContent: 'space-between', 
    marginTop: '10px',
  };

  return (
    <div>
      <h2 style={headerStyle}>
        {actionType === 'deposit' ? 'Deposit' : 'Withdraw'} Funds
      </h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label>
          Amount:
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required 
            style={inputStyle}
          />
        </label>
        <div style={buttonContainerStyle}>
          <button type="submit" style={buttonStyle}>
            {actionType === 'deposit' ? 'Deposit' : 'Withdraw'}
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ ...buttonStyle, ...cancelButtonStyle }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default DepositWithdrawForm;
