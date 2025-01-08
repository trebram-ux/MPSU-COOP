import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoArrowBackCircle } from "react-icons/io5";
import { FaSearch } from 'react-icons/fa';

axios.defaults.withCredentials = false;

const Payments = () => {
  const [accountSummaries, setAccountSummaries] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountDetails, setAccountDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loanTypeFilter, setLoanTypeFilter] = useState('All'); // Options: 'All', 'Regular', 'Emergency'

  const fetchAccountSummaries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://127.0.0.1:8000/payment-schedules/summaries/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const summariesWithNames = await Promise.all(
        response.data.map(async (summary) => {
          const memberResponse = await axios.get(
            `http://127.0.0.1:8000/members/?account_number=${summary.account_number}`,
            { withCredentials: true }
          );

          const member = memberResponse.data[0];
          return {
            ...summary,
            account_holder: member ? `${member.first_name} ${member.middle_name} ${member.last_name}` : 'Unknown',
            total_balance: summary.total_balance || 0,
          };
        })
      );

      setAccountSummaries(summariesWithNames);
    } catch (err) {
      console.error('Error fetching account summaries:', err);
      setError('Failed to fetch account summaries.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSchedules = async (accountNumber) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/payment-schedules/?account_number=${accountNumber}`,
        { withCredentials: true }
      );
  
      console.log(response.data);  // Log the response to check the structure
  
      const paidSchedules = response.data.filter(schedule => schedule.is_paid);
      setSchedules(paidSchedules);
      setSelectedAccount(accountNumber);
  
      const memberResponse = await axios.get(
        `http://127.0.0.1:8000/members/?account_number=${accountNumber}`,
        { withCredentials: true }
      );
      setAccountDetails(memberResponse.data[0]);
    } catch (err) {
      console.error('Error fetching schedules or account details:', err);
      setError('Failed to fetch payment schedules or account details.');
    } finally {
      setLoading(false);
    }
  };
  

  const calculatePaidBalance = () => {
    return schedules
      .reduce((total, schedule) => {
        if (schedule.is_paid || schedule.status === 'Paid') {
          return total + parseFloat(schedule.payment_amount || 0);
        }
        return total;
      }, 0)
      .toFixed(2);
  };

  const filterSchedulesByLoanType = () => {
    // Debugging: Log all schedules with their loan_type
    console.log('All Schedules:', schedules.map(s => ({ id: s.id, loan_type: s.loan_type })));

    if (loanTypeFilter === 'All') {
      return schedules; // Return all schedules when filter is "All"
    }

    // Safely filter schedules by loan type (case-sensitive match)
    return schedules.filter(schedule => schedule.loan_type === loanTypeFilter);
  };

  const filteredSummaries = accountSummaries.filter((summary) => {
    return (
      summary.account_number.toString().includes(searchQuery) ||
      summary.account_holder.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleLoanTypeChange = (type) => {
    console.log('Loan type filter set to:', type); // Debugging: Log the selected filter type
    setLoanTypeFilter(type);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800, height=600');
    const content = document.getElementById('print-section').innerHTML;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    fetchAccountSummaries();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ marginTop: '20px' }} className="payments-container">
      {!selectedAccount ? (
        <>
          <h2
            style={{
              textAlign: 'center',
              borderBottom: '2px solid #000000',
              color: 'black',
              width: '100%',
              marginRight: '1000px',
            }}
          >
            Paid Payments Overview
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ position: 'relative', display: 'inline-block', width: '30%' }}>
              <input
                type="text"
                placeholder="Search Payments"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '7px 40px 10px 10px',
                  fontSize: '16px',
                  border: '2px solid #000000',
                  borderRadius: '4px',
                  width: '260px',
                  marginLeft: '985px',
                }}
              />
              <button
                onClick={() => console.log('Search triggered')}
                style={{
                  position: 'absolute',
                  top: '5%',
                  fontSize: '12px',
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: 'black',
                  border: '2px solid #000000',
                  borderRadius: '4px',
                  padding: '10px',
                  marginLeft: '1245px',
                }}
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {filteredSummaries.length > 0 ? (
            <div
              style={{
                maxHeight: '450px',
                overflowY: 'auto',
                border: '2px solid black',
                marginTop: '10px',
                padding: '5px',
                borderRadius: '5px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <table
                className="account-summary-table"
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
                      backgroundColor: '#fff',
                      zIndex: 1,
                    }}
                  >
                    <th>Account Number</th>
                    <th>Account Holder</th>
                    <th>Date</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSummaries.map((summary, index) => (
                    <tr
                      key={`${summary.account_number}-${index}`}
                      onClick={() => fetchPaymentSchedules(summary.account_number)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ color: 'white' }}>{summary.account_number || 'N/A'}</td>
                      <td>{summary.account_holder}</td>
                      <td>{summary.next_due_date ? new Date(summary.next_due_date).toLocaleDateString() : 'No Due Date'}</td>
                      <td>₱ {summary.total_balance?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No ongoing schedules found.</p>
          )}
        </>
      ) : (
        <>
          <div id="print-section">
            {accountDetails && (
              <div style={{ width: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h3 style={{ color: 'black' }}>Payment History For:</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '5px', border: '2px solid black', fontWeight: 'bold' }}>Name:</td>
                      <td style={{ padding: '5px', border: '2px solid black' }}>
                        {accountDetails.first_name} {accountDetails.last_name}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px', border: '2px solid black', fontWeight: 'bold' }}>Account Number:</td>
                      <td style={{ padding: '5px', border: '2px solid black' }}>
                        {selectedAccount}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px', border: '2px solid black', fontWeight: 'bold' }}>Paid Balance:</td>
                      <td style={{ padding: '5px', border: '2px solid black' }}>
                        ₱ {calculatePaidBalance()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <button
              style={{
                color: 'black',
                padding: '5px 5px',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px',
                marginLeft: '5px',
              }}
              onClick={() => setSelectedAccount(null)}
            >
              <IoArrowBackCircle /> Back to List
            </button>

            <button
              onClick={handlePrint}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '20px',
              }}
            >
              Print Payment History
            </button>

            <div>
              <button onClick={() => handleLoanTypeChange('All')}>All Loans</button>
              <button onClick={() => handleLoanTypeChange('Regular')}>Regular Loans</button>
              <button onClick={() => handleLoanTypeChange('Emergency')}>Emergency Loans</button>
            </div>

            {filterSchedulesByLoanType().length > 0 ? (
              <div
                style={{
                  maxHeight: '385px',
                  overflowY: 'auto',
                  border: '2px solid black',
                  marginTop: '20px',
                  padding: '5px',
                  borderRadius: '5px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  width: '100%',
                  marginRight: '400px',
                }}
              >
                <style>
                  {`
                    div::-webkit-scrollbar {
                      display: none;
                    }

                    @media print {
                      button {
                        display: none;
                      }
                    }
                  `}
                </style>
                <table
                  className="payment-schedule-table"
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'center',
                    fontSize: '14px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: 'red',
                        color: 'black',
                        position: 'sticky',
                        top: '0',
                        zIndex: '1',
                      }}
                    >
                      <th>Loan Type</th>
                      <th>Principal Amount</th>
                      <th>Paid Amount</th>
                      <th>Date Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterSchedulesByLoanType().map((schedule, index) => (
                      <tr key={`${schedule.id}-${schedule.loan}-${index}`}>
                        <td>{schedule.loan_type || 'N/A'}</td>
                        <td>₱ {parseFloat(schedule.principal_amount).toFixed(2)}</td>
                        <td>₱ {parseFloat(schedule.payment_amount).toFixed(2)}</td>
                        <td>{new Date(schedule.due_date).toLocaleDateString()}</td>
                        <td>{schedule.is_paid ? 'Paid' : 'Unpaid'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No payments found for the selected loan type.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Payments;
