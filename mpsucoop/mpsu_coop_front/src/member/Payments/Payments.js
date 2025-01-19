import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

axios.defaults.withCredentials = false;

const MemberPayments = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPaymentSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const accountNumber = localStorage.getItem('account_number'); // Assuming account number is stored on login

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
    <div style={{ marginTop: '20px' }} className="member-payments-container">
      
      <button
        onClick={() => navigate(-1)} // Go back to the previous page
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Back
      </button>
      <h2 style={{ textAlign: 'center', color: 'black', fontSize: '30px' }}>
        My Paid Payments
      </h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
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
            border: '2px solid #000',
            borderRadius: '4px',
            width: '300px',
          }}
        />
        <button
          style={{
            marginLeft: '10px',
            padding: '10px 15px',
            fontSize: '16px',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <FaSearch />
        </button>
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
              <th style={{ borderBottom: '2px solid black', padding: '10px' }}>Approval Date</th>
              <th style={{ borderBottom: '2px solid black', padding: '10px' }}>Loan Type</th>
              <th style={{ borderBottom: '2px solid black', padding: '10px' }}>Loan Amount</th>
              <th style={{ borderBottom: '2px solid black', padding: '10px' }}>Principal Amount</th>
              <th style={{ borderBottom: '2px solid black', padding: '10px' }}>Payment Amount</th>
              <th style={{ borderBottom: '2px solid black', padding: '10px' }}>Payment Date</th>
              <th style={{ borderBottom: '2px solid black', padding: '10px' }}>Status</th>
              <th style={{ borderBottom: '2px solid black', padding: '10px' }}>OR NO</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((schedule, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {schedule.loan_date || 'No Date Available'}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {schedule.loan_type || 'N/A'}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  ₱ {parseFloat(schedule.loan_amount || 0).toFixed(2)}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  ₱ {parseFloat(schedule.principal_amount || 0).toFixed(2)}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  ₱ {parseFloat(schedule.payment_amount || 0).toFixed(2)}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {schedule.payment_date
                    ? new Date(schedule.due_date).toLocaleDateString()
                    : 'No Date Available'}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {schedule.is_paid ? 'Paid' : 'Unpaid'}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {schedule.or_number || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No paid payments found.</p>
      )}
    </div>
  );
};

export default MemberPayments;
