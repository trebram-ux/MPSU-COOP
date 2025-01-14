import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DepositWithdrawForm({ account, actionType, onClose, fetchAccounts, setError }) {
  const [amount, setAmount] = useState('');
  const [formattedShareCapital, setFormattedShareCapital] = useState('');
  const [isInactive, setIsInactive] = useState(false);

  const formatAmount = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  useEffect(() => {
    setFormattedShareCapital(formatAmount(account.shareCapital || 0));
    setIsInactive(account.status === 'Inactive');
  }, [account]);

  const handleChange = (e) => {
    const formattedAmount = e.target.value
      .replace(/\D/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(formattedAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isInactive) {
      setError('Account is inactive. Cannot perform transactions.');
      return;
    }
  
    let numericAmount = 0;
  
    if (actionType === 'deposit') {
      numericAmount = parseFloat(amount.replace(/,/g, ''));  // Ensure no commas
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Invalid amount for deposit.');
        return;
      }
    }
  
    if (actionType === 'withdraw') {
      numericAmount = account.shareCapital;
      if (numericAmount <= 0) {
        setError('Insufficient funds to withdraw.');
        return;
      }
    }
  
    try {
      const endpoint =
        actionType === 'deposit'
          ? `http://localhost:8000/accounts/${account.account_number}/deposit/`
          : `http://localhost:8000/accounts/${account.account_number}/withdraw/`;
  
      const response = await axios.post(
        endpoint,
        { amount: numericAmount.toString() },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log("Response:", response);  // Log the response
  
      if (actionType === 'withdraw') {
        const remainingShareCapital = account.shareCapital - numericAmount;
  
        if (remainingShareCapital <= 0) {
          await axios.patch(`http://localhost:8000/accounts/${account.account_number}/`, {
            status: 'inactive',
          });
          setIsInactive(true);
        }
      }
  
      fetchAccounts();
      onClose();
    } catch (err) {
      // Log error response if available
      if (err.response) {
        console.error("Error response data:", err.response.data);  // Log error response
        setError(err.response?.data?.error || 'An error occurred while processing your request.');
      } else {
        setError('An error occurred while processing your request.');
      }
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
    fontSize: '20px',
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
    backgroundColor: 'rgb(240, 50, 50)',
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
      <div style={{ marginBottom: '20px', textAlign: 'center', color: 'black' }}>
        <h3>Share Capital</h3>
        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
          {formattedShareCapital}
        </p>
      </div>
      {isInactive ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h3>Thank You!</h3>
          <p>Your account is inactive. No further actions are available.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={formStyle}>
          {actionType === 'deposit' && ( // Input box only for Deposit
            <label>
              Amount:
              <input
                type="text"
                value={amount}
                onChange={handleChange}
                required
                style={{
                  padding: '10px',
                  margin: '10px 0',
                  border: '2px solid black',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
              />
            </label>
          )}
          <div style={buttonContainerStyle}>
            <button type="submit" style={buttonStyle}>
              {actionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
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
      )}
    </div>
  );
}

export default DepositWithdrawForm;
