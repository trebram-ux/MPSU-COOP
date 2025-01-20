import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../Topbar/Topbar';
import axios from 'axios';

const Home = () => {
  const [memberData, setMemberData] = useState(null);
  const [loanData, setLoanData] = useState([]);
  const [paymentSchedules, setPaymentSchedules] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false); // Track if the button was clicked
  const navigate = useNavigate();

  const formatNumber = (number) => {
    if (!number) return "0.00"; // Handle empty or undefined values
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

  // Fetch member details and loan data
  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError("No authentication token found. Please log in again.");
          return;
        }

        // Fetch the member profile
        const memberResponse = await axios.get('http://localhost:8000/api/member/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const accountNumber = memberResponse.data.accountN;

        // Fetch loans associated with the logged-in member using the account number
        const loanResponse = await axios.get(`http://localhost:8000/loans/?account_number=${accountNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch payment schedules and payments for the logged-in member
        const paymentScheduleResponse = await axios.get(`http://localhost:8000/payment-schedules/?account_number=${accountNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const paymentResponse = await axios.get(`http://localhost:8000/payments/?account_number=${accountNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(loanResponse.data);
        setMemberData(memberResponse.data);
        setLoanData(loanResponse.data);
        setPaymentSchedules(paymentScheduleResponse.data);
        setPayments(paymentResponse.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch data.");
      }
    };

    fetchMemberDetails();
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p>{error}</p>
          <a href="/" style={{ display: 'inline-block', backgroundColor: '#007bff', color: 'black', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!memberData || !loanData || !paymentSchedules || !payments) return <p>Loading...</p>;

  // Find the loan associated with the logged-in member
  const loanForMember = loanData.find(loan => loan.account_number === memberData.accountN);

  // Find the payment schedule with the nearest due date for the identified loan
  const nearestPaymentSchedule = paymentSchedules
    .filter(schedule => schedule.loan_id === loanForMember?.id ) // Ensure payment schedules belong to the current loan
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]; // Sort by due date and get the nearest one

  // Calculate total amount paid for the loan (sum of payment_amount for this loan)
  const totalAmountPaid = payments
    .filter(payment => payment.loan_id === loanForMember?.id) // Filter payments for the same loan
    .reduce((acc, payment) => acc + parseFloat(payment.payment_amount || 0), 0);
    


  // Calculate total payment amount for the loan (sum of payment_amount for this loan)
  const totalPaymentAmount = paymentSchedules
    .filter(schedule => schedule.loan_id === loanForMember?.id) // Filter schedules for the same loan
    .reduce((acc, schedule) => acc + parseFloat(schedule.payment_amount || 0), 0);

  // Calculate total interest due for the loan (sum of interest_due for this loan)
  const totalInterestDue = nearestPaymentSchedule && !isNaN(nearestPaymentSchedule.interest_due)
    ? parseFloat(nearestPaymentSchedule.interest_due).toFixed(2) // Use toFixed for formatting
    : 'Interest Due: Data not available';

  // Handle dropdown toggle and hide "More" button after clicking
  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
    setButtonClicked(true); // Mark the button as clicked
  };

  // Handle navigation for dropdown options
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div>
      <Topbar />
      <div style={{ backgroundColor: '#D5ED9F', height: '100%', width: '100%', fontFamily: 'Arial, sans-serif', color: 'black' }}>
        <div style={{ padding: '20px' }}>
          <section id="welcome">
            <h2 style={{ fontWeight: 'bolder', color: 'black', marginLeft: '10px', borderBottom: '3px solid black', fontSize: '50px', width: '100%' }}>
              WELCOME!!
            </h2>
          </section>

          <div style={{ display: 'flex', gap: '60px', marginTop: '60px', justifyContent: 'center' }}>
            {/* Left Card */}
            <div
              style={{
                backgroundColor: 'rgb(213, 242, 145)',
                borderRadius: '8px',
                width: '800px',
                padding: '20px',
                height: '400px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3
                style={{
                  fontWeight: 'bold',
                  color: 'black',
                  borderBottom: '3px solid rgb(0, 0, 0)',
                  paddingBottom: '10px',
                  textAlign: 'center',
                  fontSize: '30px',
                }}
              >
                {memberData.first_name?.toUpperCase()} {memberData.middle_name?.toUpperCase()} {memberData.last_name?.toUpperCase()}
              </h3>
              <p style={{ textAlign: 'center', fontSize: '30px' }}>
                <strong>ACCOUNT NUMBER:</strong> {memberData.accountN || 'N/A'}
              </p>
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '30px' }}>
                SHARE CAPITAL: <span style={{ fontSize: '30px', fontWeight: '900' }}>{formatNumber(memberData.share_capital || 'N/A')}</span>
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '50px' }}>
                <div
                  style={{
                    backgroundColor: 'green',
                    borderRadius: '20px',
                    width: '45%',
                    textAlign: 'center',
                    padding: '10px',
                    fontWeight: 'bold',
                  }}
                >
                
                  <p style={{ margin: 0, fontSize: '30px' }}>REGULAR LOAN</p>
                  <p style={{ margin: 0, fontSize: '30px' }}>{loanData[0]?.loanable_amount !== undefined ? formatNumber(loanData[0].loanable_amount) : 'N/A'}</p>
                </div>
                <div
                  style={{
                    backgroundColor: 'red',
                    borderRadius: '20px',
                    width: '45%',
                    textAlign: 'center',
                    padding: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '30px' }}>EMERGENCY LOAN</p>
                  <p style={{ margin: 0, fontSize: '30px' }}>{loanData.emergency_loan_amount || '50,000.00'}</p>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <section style={{ flex: 1 }}>
              <div style={{ backgroundColor: '#c8f7ce', borderRadius: '8px', width: '600px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                <h3 style={{ textAlign: 'left', color: 'black', fontSize: '30px' }}>
                  {nearestPaymentSchedule ? `Loan Due on: ${new Date(nearestPaymentSchedule.due_date).toLocaleDateString()}` : 'Loan Due Date: N/A'}
                </h3>
                <div style={{ textAlign: 'left', margin: '20px 0', fontSize: '30px'}}>
                  <p style={{ fontSize: '30px', fontWeight: 'bold', color: 'blue' }}>
                    {formatNumber(nearestPaymentSchedule?.payment_amount || 0)}
                  </p>

                  <p>Amount Paid:</p>
                  <p>{formatNumber(totalAmountPaid.toFixed(2))} out of {formatNumber(totalPaymentAmount.toFixed(2))}</p>
                  <div style={{ backgroundColor: 'red', borderRadius: '20px', height: '8px', width: '100%', fontSize: '30px' }}>
                    <div
                      style={{
                        height: '10%',
                        width: `${(totalAmountPaid / totalPaymentAmount) * 100}%`,
                        borderRadius: '20px',
                        backgroundColor: 'red',
                        fontSize: '30px'
                      }}
                    ></div>
                    <div
                      style={{
                        width: `${((totalPaymentAmount - totalAmountPaid) / totalPaymentAmount) * 100}%`,
                        borderRadius: '20px',
                        backgroundColor: 'red',
                        position: 'absolute',
                        top: 0,
                        left: `${(totalAmountPaid / totalPaymentAmount) * 100}%`,
                        fontSize: '30px'
                      }}
                    ></div>
                  </div>

                  <p style={{ marginTop: '10px' }}><strong>Interest Rate:</strong> {loanData[0]?.interest_rate || '0'}%</p>
                  <div style={{ textAlign: 'left', marginTop: '15px' }}>
                    {!buttonClicked && (
                      <button
                        style={{ display: 'inline-block', backgroundColor: '#007bff', color: 'black', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}
                        onClick={handleDropdownToggle}
                      >
                        More
                      </button>
                    )}
                    {dropdownOpen && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                        <button onClick={() => handleNavigation('/accounts')} style={{ marginBottom: '10px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', borderRadius: '5px', fontWeight: 'bold' }}>
                          View Ledger
                        </button>
                        <button onClick={() => handleNavigation('/loans')} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', borderRadius: '5px', fontWeight: 'bold' }}>
                          View Loan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
