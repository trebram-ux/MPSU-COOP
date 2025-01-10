import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoArrowBackCircle } from "react-icons/io5";
import { FaSearch } from 'react-icons/fa';
import Receipt from './Receipt';
import ReactDOM from 'react-dom';
import { SiFormspree } from "react-icons/si";

axios.defaults.withCredentials = false;

const PaymentSchedule = () => {
  const [accountSummaries, setAccountSummaries] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountDetails, setAccountDetails] = useState(null);
  const [paying, setPaying] = useState(false);
  const [loanType, setLoanType] = useState('Regular'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [receiptPrinted, setReceiptPrinted] = useState(false);

  // Fetch account summaries
  const fetchAccountSummaries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://127.0.0.1:8000/payment-schedules/summaries/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // Remove duplicate account numbers by merging summaries
      const uniqueSummaries = response.data.reduce((acc, summary) => {
        if (!acc[summary.account_number]) {
          acc[summary.account_number] = { 
            ...summary, 
            total_balance: summary.total_balance || 0 
          };
        } else {
          acc[summary.account_number].total_balance += summary.total_balance || 0;
        }
        return acc;
      }, {});

      // Fetch account holder names for each account
      const accountNumbers = Object.keys(uniqueSummaries);
      const namePromises = accountNumbers.map((accountNumber) =>
        axios.get(`http://127.0.0.1:8000/members/?account_number=${accountNumber}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
      );
      const nameResponses = await Promise.all(namePromises);

      // Map account holder names to summaries
      accountNumbers.forEach((accountNumber, index) => {
        const memberData = nameResponses[index].data[0];
        if (memberData) {
          uniqueSummaries[accountNumber].account_holder = `${memberData.first_name} ${memberData.middle_name} ${memberData.last_name}`;
        }
      });

      setAccountSummaries(Object.values(uniqueSummaries));
    } catch (err) {
      console.error('Error fetching account summaries:', err);
      setError('Failed to fetch account summaries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter account summaries based on search query
  const filteredSummaries = accountSummaries.filter(summary =>
    summary.account_number.toString().includes(searchQuery) ||
    summary.account_holder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch payment schedules based on account number and loan type
  const fetchPaymentSchedules = async (accountNumber, loanType) => {
    setSchedules([]);
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/payment-schedules/?account_number=${accountNumber}&loan_type=${loanType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setSchedules(response.data);
      setSelectedAccount(accountNumber);

      // Fetch account details
      const memberResponse = await axios.get(
        `http://127.0.0.1:8000/members/?account_number=${accountNumber}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setAccountDetails(memberResponse.data[0]);
    } catch (err) {
      console.error('Error fetching schedules or account details:', err);
      setError('Failed to fetch payment schedules or account details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mark payment as paid
  const markAsPaid = async (id) => {
    setPaying(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/payment-schedules/${id}/mark-paid/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Payment schedule marked as paid:', response.data);
  
      // Update the status to 'Paid' for the current schedule
      setSchedules((prevSchedules) =>
        prevSchedules.map((s) =>
          s.id === id ? { ...s, is_paid: true, status: 'Paid' } : s
        )
      );
    } catch (err) {
      console.error('Error while marking as paid:', err.response ? err.response.data : err.message);
    } finally {
      setPaying(false);
    }
  };
  
  // New helper function to check if previous payments are paid
  const arePreviousPaymentsPaid = (scheduleId) => {
    const index = schedules.findIndex((schedule) => schedule.id === scheduleId);
    if (index > 0) {
      // Check if the previous schedule is marked as paid
      return schedules[index - 1].is_paid;
    }
    return true; // If it's the first schedule, no previous payment exists
  };
  
  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    return schedules
      .reduce((total, schedule) => {
        if (!schedule.is_paid || schedule.status === 'Ongoing') {
          return total + parseFloat(schedule.payment_amount || 0);
        }
        return total;
      }, 0)
      .toFixed(2);
  };

  // Handle loan type selection (Regular or Emergency)
  const handleLoanTypeChange = (type) => {
    setLoanType(type); // Update the loanType state
    if (selectedAccount) {
      fetchPaymentSchedules(selectedAccount, type); // Re-fetch schedules based on selected account and loan type
    }
  };

    const handlePrintReceipt = (PaymentSchedule) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600', 'position=center');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Official Receipt</title>
        </head>
        <body>
          <div id="print-content"></div>
          <script src="https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js"></script>
        </body>
      </html>
    `);

    ReactDOM.render(
      <Receipt prefilledData={PaymentSchedule} />,
      printWindow.document.getElementById('print-content')
    );

    // Trigger print after rendering
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

// Function to handle when receipt is printed
const handleReceiptPrinted = () => {
  setReceiptPrinted(true);
};

const generateReceipt = (schedule) => {
  // Ensure accountDetails and schedule are available
  if (!accountDetails || !schedule) {
    console.error("Missing data for generating receipt");
    return;
  }

  console.log("Generating receipt...");

  // Open a new window for the receipt
  const receiptWindow = window.open("", "Receipt", "width=600,height=400");

  if (!receiptWindow) {
    console.error("Failed to open window.");
    return;
  }

  console.log("Window opened, preparing to write content...");

  // Wait for the window to load and then write the content
  setTimeout(() => {
    console.log("Writing content to the window...");

    const receiptContent = ` 
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Receipt Test</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid black; padding: 10px; text-align: left; }
              .footer { margin-top: 20px; text-align: center; font-size: 12px; }
          </style>
      </head>
      <body>
          <h1>Acknowledgement Receipt</h1>
          <table>
              <tr>
                <th>Loan Type</th>
                <td>${loanType}</td>
              </tr>
              <tr>
                  <th>Account Number</th>
                  <td>${selectedAccount}</td>
              </tr>
              <tr>
                <th>Account Holder</th>
                <td>${accountDetails ? `${accountDetails.first_name} ${accountDetails.middle_name} ${accountDetails.last_name}` : 'N/A'}</td>
              </tr>
              <tr>
                <th>Payment Amount</th>
                <td>₱ ${(isNaN(schedule.payment_amount) ? 0 : parseFloat(schedule.payment_amount)).toFixed(2)}</td>
              </tr>
              <tr>
                  <th>Due Date</th>
                  <td>${new Date(schedule.due_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                  <th>Status</th>
                  <td>${schedule.is_paid ? "Paid" : "Ongoing"}</td>
              </tr>
          </table>
          <div class="footer">
              <p>Thank you for your payment!</p>
          </div>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();

    console.log("Content written. Attempting to print...");

    // Wait a moment before printing
    setTimeout(() => {
      console.log("Attempting to print...");
      receiptWindow.print();
      handleReceiptPrinted(); // Mark as printed after the print
    }, 500); // Delay before printing
  }, 100); // Delay before writing to the window
};
  
  // Initial fetch of account summaries when the component mounts
  useEffect(() => {
    fetchAccountSummaries();
  }, []);

  // Loading or error display
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ marginTop: '20px' }} className="payments-container">
      {!selectedAccount ? (
        <>
          <h2
            style={{
              width: '98%', marginTop: '-25px',  padding: '20px', textAlign: 'center', borderBottom: '2px solid #000000', color: 'black'
            }}
          >
            Ongoing Payment Schedules
          </h2>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Prevent default link behavior
              handlePrintReceipt();
            }}
            style={{
              padding: '5px',
              cursor: 'pointer',
              color: 'black',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'goldenrod'; 
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'black';
            }}
          >
            <SiFormspree /><strong>Official Receipt</strong>
          </a>

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
                  border: '2px solid #000',
                  borderRadius: '4px',
                  width: '270px',
                  marginLeft: '980px',
                  marginBottom: '10px',
                  marginTop: '-10px',
                }}
              />
              <button
                onClick={() => console.log('Search triggered')}
                style={{
                  position: 'absolute',
                  top: '-13px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: 'black',
                  border: '2px solid #000000',
                  borderRadius: '4px',
                  padding: '10px',
                  marginLeft: '1215px',
                }}
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {filteredSummaries.length > 0 ? (
            <div
              style={{
                maxHeight: '430px',
                overflowY: 'auto',
                border: '2px solid black',
                marginTop: '10px',
                padding: '5px',
                borderRadius: '5px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                fontSize: '20px' 
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
                      fontSize: '20px' 
                    }}
                  >
                    <th>Account Number</th>
                    <th>Account Holder</th>
                    <th>Next Due Date</th>
                    <th>Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSummaries.map((summary) => (
                    <tr
                      key={summary.account_number}
                      onClick={() => fetchPaymentSchedules(summary.account_number, loanType)} // Pass loanType here
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ color: 'white' }}>{summary.account_number || 'N/A'}</td>
                      <td>{summary.account_holder || 'N/A'}</td>
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
          {accountDetails && (
            <>
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
                      <td style={{ padding: '5px', border: '2px solid black', fontWeight: 'bold' }}>Remaining Balance:</td>
                      <td style={{ padding: '5px', border: '2px solid black' }}>
                        ₱ {calculateRemainingBalance()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button onClick={() => handleLoanTypeChange('Regular')} style={{ backgroundColor: loanType === 'Regular' ? 'green' : 'gray', color: 'black', padding: '5px 5px', border: 'none', cursor: 'pointer', borderRadius: '5px', marginLeft: '5px' }}>Regular Loan</button>
              <button onClick={() => handleLoanTypeChange('Emergency')} style={{ backgroundColor: loanType === 'Emergency' ? 'green' : 'gray', color: 'black', padding: '5px 5px', border: 'none', cursor: 'pointer', borderRadius: '5px', marginLeft: '5px' }}>Emergency Loan</button>
              <button style={{ color: 'black', padding: '5px 5px', border: 'none', cursor: 'pointer', borderRadius: '5px', marginLeft: '5px', }} onClick={() => setSelectedAccount(null)}><IoArrowBackCircle />Back to List</button>
            </>
          )}

          {schedules.length > 0 ? (
            <div
            style={{
              maxHeight: '385px',
              overflowY: 'auto',
              border: '2px solid black',
              marginTop: '20px',
              padding: '5px',
              borderRadius: '5px',
              scrollbarWidth: 'none', // For Firefox
              msOverflowStyle: 'none', // For IE and Edge
              width: '100%',
              marginRight: '400px',
            }}
          >
            <style>
              {`
                /* For WebKit-based browsers (Chrome, Safari, etc.) */
                div::-webkit-scrollbar {
                  display: none;
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
                  <th>Principal Amount</th>
                  <th>Interest Amount</th>
                  {loanType === 'Regular' && <th>Service Fee</th>} {/* Conditionally render Service Fee */}
                  <th>Payment Amount</th>
                  <th>Due Date</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>₱ {(parseFloat(schedule.principal_amount) || 0).toFixed(2)}</td>
                    <td>₱ {(parseFloat(schedule.interest_amount) || 0).toFixed(2)}</td>
                    {loanType === 'Regular' && (
                      <td>₱ {(parseFloat(schedule.service_fee_component) || 0).toFixed(2)}</td>
                    )}
                    <td>₱ {(parseFloat(schedule.payment_amount) || 0).toFixed(2)}</td>
                    <td>{new Date(schedule.due_date).toLocaleDateString()}</td>
                    <td>₱ {(parseFloat(schedule.balance) || 0).toFixed(2)}</td>
                    <td style={{ color: schedule.is_paid ? 'goldenrod' : 'red' }}>
                      {schedule.is_paid ? 'Paid!' : 'Ongoing'}
                    </td>
                    <td>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      {!schedule.is_paid && (
                        <button
                        style={{
                          backgroundColor: 'goldenrod',
                          color: 'black',
                          border: '2px solid black',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          cursor: arePreviousPaymentsPaid(schedule.id) ? 'pointer' : 'not-allowed',
                          fontSize: '14px',
                          flex: '1',
                        }}
                        onClick={() => {
                          if (arePreviousPaymentsPaid(schedule.id)) {
                            markAsPaid(schedule.id);
                          }
                        }}
                        disabled={!arePreviousPaymentsPaid(schedule.id)} // Disable if previous payment is not paid
                      >
                        {paying ? 'Processing...' : 'Pay'}
                      </button>
                      )}

                      <button
                        onClick={() => generateReceipt(schedule)}
                        style={{
                          backgroundColor: 'goldenrod',
                          color: 'black',
                          cursor: 'pointer',
                          border: '2px solid black',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          fontSize: '14px',
                          flex: '1',
                        }}
                      >
                        {receiptPrinted ? 'View Receipt' : 'Print Receipt'}
                      </button>

                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>          
          ) : (
            <p>No payment schedules found for this account.</p>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentSchedule;
