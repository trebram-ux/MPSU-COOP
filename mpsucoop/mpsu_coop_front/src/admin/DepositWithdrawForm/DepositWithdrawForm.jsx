import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DepositWithdrawForm({ account, actionType, onClose, fetchAccounts, setError }) {
  const [amount, setAmount] = useState('');
  const [formattedShareCapital, setFormattedShareCapital] = useState('');

  const formatAmount = (value) => {
    // Format numeric value with commas
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  useEffect(() => {
    // Format the Share Capital dynamically whenever the account prop changes
    setFormattedShareCapital(formatAmount(account.shareCapital || 0));
  }, [account]);

  const handleChange = (e) => {
    // Format input value as user types
    const formattedAmount = e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(formattedAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount.replace(/,/g, ''));

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Invalid amount');
      return;
    }

    try {
      const endpoint = actionType === 'deposit'
        ? `http://localhost:8000/accounts/${account.account_number}/deposit/`
        : `http://localhost:8000/accounts/${account.account_number}/withdraw/`;

      await axios.post(endpoint, { amount: numericAmount });
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
    backgroundColor: 'red',
  };

  const headerStyle = {
    color: 'black',
    textAlign: 'center',
    marginBottom: '30px',
    marginTop: '30px',
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
      {/* Display Share Capital */}
      <div style={{ marginBottom: '20px', textAlign: 'center', color: 'black' }}>
        <h3>Share Capital</h3>
        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
          {formattedShareCapital}
        </p>
      </div>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label>
          Amount:
          <input
            type="text"
            value={amount}
            onChange={handleChange}
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
