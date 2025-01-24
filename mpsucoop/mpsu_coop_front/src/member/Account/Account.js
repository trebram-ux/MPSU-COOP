import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Topbar from '../Topbar/Topbar';
import Payment from '../Payments/Payments';
import './Account.css';

const Ledger = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  const formatNumber = (number) => {
    if (!number) return '0.00';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const accountNumber = localStorage.getItem('account_number');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    setIsAdmin(userRole === 'admin');

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!accountNumber || !token) {
          setError('Account number or token missing.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/api/account/${accountNumber}/transactions/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTransactions(response.data.transactions);
      } catch (err) {
        setError('Failed to fetch transactions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountNumber, userRole]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="ledger-container">
      {/* Left Section */}
      <div className="ledger-left">
        <Topbar />
        <h1>{isAdmin ? 'All Transactions' : 'My Transactions'}</h1>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="back-button"
        >
          Go Back
        </button>

        {/* Payment Toggle Link */}
        <button
          onClick={() => setShowPayments(!showPayments)}
        >
          {showPayments ? 'Hide Payments' : 'View Payments'}
        </button>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Transaction Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Balance</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.transaction_type}</td>
                <td>{formatNumber(transaction.amount)}</td>
                <td>{transaction.description}</td>
                <td>{formatNumber(transaction.balance_after_transaction)}</td>
                <td>{new Date(transaction.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Section for Payments */}
      <div className="ledger-right">
        {showPayments && <Payment />}
      </div>
    </div>
  );
};

export default Ledger;