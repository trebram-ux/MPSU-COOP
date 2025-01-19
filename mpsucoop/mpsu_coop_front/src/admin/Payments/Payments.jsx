import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoArrowBackCircle } from "react-icons/io5";
import { FaSearch } from 'react-icons/fa';
import { BsFillPrinterFill } from "react-icons/bs";


axios.defaults.withCredentials = false;

const Payments = () => {
  const [accountSummaries, setAccountSummaries] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountDetails, setAccountDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loanTypeFilter, setLoanTypeFilter] = useState('All');

    // State to hold the generated OR number for each schedule
    const [generatedOrNumbers, setGeneratedOrNumbers] = useState({});

    const generateOrNumber = (scheduleId) => {
      // Generate OR number based on the schedule ID and timestamp for uniqueness
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000); // Random 3-digit number
      return `OR-${scheduleId}-${timestamp}-${randomSuffix}`;
    };
  
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
     
        console.log(response.data);  // Log the full response
     
        // Filter out schedules that are paid
        const paidSchedules = response.data.filter(schedule => schedule.is_paid || schedule.status === 'Paid');
     
        const schedulesWithOrNumbers = paidSchedules.map(schedule => {
          // Generate OR number for each schedule
          const orNumber = generateOrNumber(schedule.id);
          return { ...schedule, or_number: orNumber , loan_amount: schedule.loan_amount || 0}; // Add OR number to schedule
        });
     
        setSchedules(schedulesWithOrNumbers);
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
      return filterSchedulesByLoanType()
        .reduce((total, schedule) => {
          if (schedule.is_paid || schedule.status === 'Paid') {
            return total + parseFloat(schedule.payment_amount || 0);
          }
          return total;
        }, 0)
        .toFixed(2);
    };
  
    const filterSchedulesByLoanType = () => {
      if (loanTypeFilter === 'All') {
        return schedules;
      }
  
      return schedules.filter(schedule => schedule.loan_type === loanTypeFilter);
    };
  
    const filteredSummaries = accountSummaries.filter((summary) => {
      return (
        summary.account_number.toString().includes(searchQuery) ||
        summary.account_holder.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  
    const handleLoanTypeChange = (type) => {
      setLoanTypeFilter(type);
    };
  
    const handlePrint = () => {
      const printWindow = window.open('', '', 'width=800, height=600');
      const content = document.getElementById('print-section').innerHTML;
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    };
  
    const handlePaymentSubmit = async (scheduleId, paymentAmount) => {
      // Add logic to save payment and assign an OR number
      const orNumber = generateOrNumber(scheduleId);
  
      // Add logic to update the payment schedule or call the API to save this payment with OR number
      try {
        await axios.post('http://127.0.0.1:8000/payment-schedules/payment/', {
          schedule_id: scheduleId,
          payment_amount: paymentAmount,
          or_number: orNumber,
          // Add any other necessary fields here
        });
        alert(`Payment submitted with OR number: ${orNumber}`);
      } catch (error) {
        console.error('Error submitting payment:', error);
      }
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
          <h2 style={{ width: '98%', marginTop: '-25px',  padding: '20px', textAlign: 'center', color: 'black', fontSize: '30px'}}>Paid Payments Overview</h2>
            <d style={{ position: 'relative', display: 'inline-block', width: '30%' }}>
              <input type="text"placeholder="Search Payments"value={searchQuery}onChange={(e) => setSearchQuery(e.target.value)}style={{padding: '7px 40px 10px 10px',fontSize: '16px',border: '0px',borderRadius: '4px',width: '250px',marginLeft: '950px',marginBottom: '30px',marginTop: '-10px',}}/></d>
          {filteredSummaries.length > 0 ? (
            <div
              style={{
                maxHeight: '430px',
                overflowY: 'auto',
                boxShadow: '0px 0px 15px 0px rgb(154, 154, 154)',
                marginTop: '10px',
                padding: '5px',
                borderRadius: '5px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                width: '103.5%',
                marginLeft: '-30px',fontSize: '20px'}}>
              <table className="account-summary-table"style={{borderCollapse: 'collapse',width: '100%',}}>
                <thead>
                  <tr style={{borderBottom: '1px solid black',position: 'sticky',top: '-5px',backgroundColor: 'black',zIndex: 1,fontSize: '20px'}}>
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
                      <td style={{ color: 'blue' }}>{summary.account_number || 'N/A'}</td>
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
              <div style={{ width: '48%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ color: 'black', fontSize: '20px', marginTop: '-50px'}}>Payment History For:</h3>
              <table style={{borderCollapse: 'collapse', marginTop: '10px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '5px', border: '0px', fontWeight: 'bold', fontSize: '18px', borderBottom: '1px solid rgba(218, 218, 218, 0.68)'}}>Name:</td>
                  <td style={{ padding: '5px', border: '0px', fontSize: '18px', borderBottom: '1px solid rgba(218, 218, 218, 0.68)', width: '100px'}}>
                    {accountDetails.first_name} {accountDetails.middle_name}  {accountDetails.last_name}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '5px', border: '0px', fontWeight: 'bold', fontSize: '18px', borderBottom: '1px solid rgba(218, 218, 218, 0.68)' }}>Account Number:</td>
                  <td style={{ padding: '5px', border: '0px', fontSize: '18px', borderBottom: '1px solid rgba(218, 218, 218, 0.68)' }}>
                    {selectedAccount}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '5px', border: '0px', fontWeight: 'bold', fontSize: '18px', borderBottom: '1px solid rgba(218, 218, 218, 0.68)' }}>Paid Balance:</td>
                  <td style={{ padding: '5px', border: '0px', fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid rgba(218, 218, 218, 0.68)', width: '100px'}}>
                  ₱{calculatePaidBalance()}
                  </td>
                </tr>

                {/* Regular Loan Details */}
                {filterSchedulesByLoanType().some(schedule => schedule.loan_type === 'Regular') && (
                  <tr>
                    <td style={{ padding: '5px', border: '0px', fontWeight: 'bold', fontSize: '18px', borderBottom: '1px solid rgba(218, 218, 218, 0.68)' }}>Regular Loan - Approval Date:</td>
                    <td style={{ padding: '5px', border: '0px', fontWeight: 'bold',fontSize: '18px', borderBottom: '1px solid rgba(218, 218, 218, 0.68)' }}>
                      {new Date(
                        filterSchedulesByLoanType().find(schedule => schedule.loan_type === 'Regular')?.loan_date
                      ).toLocaleDateString() || 'No Date Available'}
                    </td>
                    <td style={{ padding: '5px', border: '0px', fontWeight: 'bold', fontSize: '18px', borderBottom: '1px solidrgba(218, 218, 218, 0.68)'}}>Amount:</td>
                    <td style={{ padding: '5px', border: '0px', fontSize: '18px', fontWeight: 'bold' , borderBottom: '1px solid rgba(218, 218, 218, 0.68)'}}>
                      ₱{parseFloat(
                        filterSchedulesByLoanType().find(schedule => schedule.loan_type === 'Regular')?.loan_amount || 0
                      ).toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* Emergency Loan Details */}
                {filterSchedulesByLoanType().some(schedule => schedule.loan_type === 'Emergency') && (
                  <tr>
                    <td style={{ padding: '5px', border: '0px', fontWeight: 'bold', fontSize: '18px', borderBottom: '1px solid rgba(218, 218, 218, 0.68)'}}>Emergency Loan - Approval Date:</td>
                    <td style={{ padding: '5px', border: '0px', fontWeight: 'bold',fontSize: '18px' , borderBottom: '1px solid rgba(218, 218, 218, 0.68)'}}>
                      {new Date(
                        filterSchedulesByLoanType().find(schedule => schedule.loan_type === 'Emergency')?.loan_date
                      ).toLocaleDateString() || 'No Date Available'}
                    </td>
                    <td style={{ padding: '5px', border: '0px', fontWeight: 'bold', fontSize: '18px' , borderBottom: '1px solid rgba(218, 218, 218, 0.68)'}}>Amount:</td>
                    <td style={{ padding: '5px', border: '0px', fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid rgba(218, 218, 218, 0.68)'}}>
                      ₱{parseFloat(
                        filterSchedulesByLoanType().find(schedule => schedule.loan_type === 'Emergency')?.loan_amount || 0
                      ).toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
            )}
          
            <div
            className = "button"
            style = {{
              display: 'inline-flex',
              marginTop: '20px'
            }}
            >
            <div
            >
              <button onClick={() => setSelectedAccount(null)}><IoArrowBackCircle /> Back </button>
              <button 
              onClick={() => handleLoanTypeChange('All')} 
              style={{
                backgroundColor: 'transparent', 
                color: loanTypeFilter === 'All' ? 'rgb(4, 202, 93)' : 'black', 
                cursor: 'pointer', 
                border: 'none', 
                padding: '5px 10px',
                textDecoration: loanTypeFilter === 'All' ? 'underline' : 'none',
                marginLeft: '50px'
              }}
            >
              All Loans
            </button>

            <button 
              onClick={() => handleLoanTypeChange('Regular')} 
              style={{
                backgroundColor: 'transparent', 
                color: loanTypeFilter === 'Regular' ? 'rgb(4, 202, 93)' : 'black', 
                cursor: 'pointer', 
                border: 'none', 
                padding: '5px 10px',
                textDecoration: loanTypeFilter === 'Regular' ? 'underline' : 'none'
              }}
            >
              Regular Loans
            </button>

            <button 
              onClick={() => handleLoanTypeChange('Emergency')} 
              style={{
                backgroundColor: 'transparent', 
                color: loanTypeFilter === 'Emergency' ? 'rgb(4, 202, 93)' : 'black', 
                cursor: 'pointer', 
                border: 'none', 
                padding: '5px 10px',
                textDecoration: loanTypeFilter === 'Emergency' ? 'underline' : 'none'
              }}
            >
              Emergency Loans
            </button>
            
              <button 
              onClick={handlePrint} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontSize: '24px',
                cursor: 'pointer',
                backgroundColor: '#ede9c7',
                border: 'none',
                position: 'fixed',
                marginLeft: '1230px',
                marginTop: '-30px'
              }}
              className="print-button"
            >
              <span style={{ marginRight: '8px' }}><BsFillPrinterFill /></span>
            </button>

            <style>
            {`
              @media print {
                .print-button {
                  display: none;
                }
              }
            `}
            </style>
            </div>
            </div>
            
            {filterSchedulesByLoanType().length > 0 ? (
              <div
              style={{
                maxHeight: '320px',
                overflowY: 'auto',
                boxShadow: '0px 0px 15px 0px rgb(154, 154, 154)',
                marginTop: '30px',
                padding: '5px',
                borderRadius: '5px',
                scrollbarWidth: 'none', // For Firefox
                msOverflowStyle: 'none', // For IE and Edge
                width: '99%',
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
                  fontSize: '18px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'red',
                      color: 'black',
                      position: 'sticky',
                      top: '-5px',
                      zIndex: '1',
                    }}
                  >
                      <th>Loan Type</th>
                      <th>Principal Amount</th>
                      <th>Paid Amount</th>
                      <th>Date Paid</th>
                      <th>Status</th>
                      <th>OR Number</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {filterSchedulesByLoanType().map((schedule, index) => (
                      <tr key={`${schedule.id}-${index}`}>
                        {/* <td>{schedule.loan_date? new Date(schedule.loan_date).toLocaleDateString(): 'No Date Available'}</td>
                        <td>₱ {parseFloat(schedule.loan_amount).toFixed(2)}</td> */}
                        <td>{schedule.loan_type || 'N/A'}</td>
                        <td>₱ {parseFloat(schedule.principal_amount).toFixed(2)}</td>
                        <td>₱ {parseFloat(schedule.payment_amount).toFixed(2)}</td>
                        <td>{new Date(schedule.due_date).toLocaleDateString()}</td>
                        <td>{schedule.is_paid ? 'Paid' : 'Unpaid'}</td>
                        <td>{schedule.or_number}</td>
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
