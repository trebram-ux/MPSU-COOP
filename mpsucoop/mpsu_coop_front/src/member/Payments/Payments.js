import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../Topbar/Topbar';

axios.defaults.withCredentials = false;

const MemberPayments = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const formatNumber = (number) => {
    if (!number) return "0.00";
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const fetchPaymentSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const accountNumber = localStorage.getItem('account_number');

      if (!accountNumber) {
        setError('Account number is missing. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/payment-schedules/?account_number=${accountNumber}`,
        { withCredentials: true }
      );

      console.log('API Response: ', response.data);

      const paidSchedules = response.data.filter(
        (schedule) => schedule.is_paid || schedule.status === 'Paid'
      );

      const schedulesWithDetails = paidSchedules.map((schedule) => ({
        ...schedule,
        payment_date: schedule.payment_date
          ? new Date(schedule.payment_date).toLocaleDateString()
          : 'N/A',
        or_number: schedule.or_number || 'N/A', // Ensure OR NO field is included
      }));

      setSchedules(schedulesWithDetails);
    } catch (err) {
      console.error('Error fetching payment schedules:', err);
      setError('Failed to fetch payment schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentSchedules();
  }, []);

  const filteredSchedules = schedules.filter((schedule) =>
    schedule.payment_date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div
      style={{
        padding: '10px',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <Topbar />
      <h2
        style={{
          textAlign: 'center',
          color: '#000000',
          fontSize: '30px',
          marginBottom: '50px',
          marginTop: '110px',
        }}
      >
        My Paid Payments
      </h2>
      <button
        onClick={() => navigate(-1)}
        style={{
          fontSize: '16px',
          backgroundColor: '#37ff7d',
          color: 'rgb(0, 0, 0)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          marginBottom: '-10px',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#ff00e1')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#37ff7d')}
      >
        Back
      </button>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          marginTop: '-50px',
        }}
      >
        <input
          type="text"
          placeholder="Search by Date"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '4px',
            width: '300px',
            marginLeft: '580px',
          }}
        />
      </div>

      {filteredSchedules.length > 0 ? (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            marginTop: '20px',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  backgroundColor: '#007bff',
                  color: 'rgb(0, 0, 0)',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  padding: '15px',
                }}
              >
                Approval Date
              </th>
              <th style={{ padding: '15px' }}>Loan Type</th>
              <th style={{ padding: '15px' }}>Loan Amount</th>
              <th style={{ padding: '15px' }}>Principal Amount</th>
              <th style={{ padding: '15px' }}>Payment Amount</th>
              <th style={{ padding: '15px' }}>Payment Date</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>OR NO</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((schedule, index) => (
              <tr key={index}>
                <td>{schedule.loan_date || 'No Date Available'}</td>
                <td>{schedule.loan_type || 'N/A'}</td>
                <td>₱ {formatNumber(parseFloat(schedule.loan_amount || 0).toFixed(2))}</td>
                <td>₱ {formatNumber(parseFloat(schedule.principal_amount || 0).toFixed(2))}</td>
                <td>₱ {formatNumber(parseFloat(schedule.payment_amount || 0).toFixed(2))}</td>
                <td>
                  {schedule.payment_date
                    ? new Date(schedule.due_date).toLocaleDateString()
                    : 'No Date Available'}
                </td>
                <td>{schedule.is_paid ? 'Paid' : 'Unpaid'}</td>
                <td>{schedule.or_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p
          style={{
            textAlign: 'center',
            fontSize: '16px',
            color: '#000000',
            marginTop: '20px',
          }}
        >
          No paid payments found.
        </p>
      )}
    </div>
  );
};

export default MemberPayments;
