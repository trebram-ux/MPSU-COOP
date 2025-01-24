// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom'; 
// import Topbar from './Topbar/Topbar';

// const MemberPayments = () => {
//   const { control_number } = useParams(); // Get control_number from the URL
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

// useEffect(() => {
//   if (!control_number) {
//     setError("Schedule ID is not provided.");
//     setLoading(false);
//     return;
//   }

//   const fetchPayments = async () => {
//     try {
//       const response = await axios.get(
//         `http://127.0.0.1:8000/api/member-payments/?schedule=${control_number}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );
//       setPayments(response.data);
//     } catch (err) {
//       setError("Failed to fetch payments. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchPayments();
// }, [control_number]);


//   if (loading) return <p>Loading payments...</p>;
//   if (error) return <p style={{ color: 'red' }}>{error}</p>;

//   return (
//     <div>
//     <Topbar />
//       <h2>My Payments</h2>
//       {payments.length > 0 ? (
//         <table>
//           <thead>
//             <tr>
//               <th>Loan Control Number</th>
//               <th>Due Date</th>
//               <th>Principal Amount</th>
//               <th>Interest Amount</th>
//               <th>Service Fee</th>
//               <th>Paid Amount</th>
//               <th>Date Paid</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {payments.map((payment) => (
//               <tr key={payment.OR}>
//                 <td>{payment.payment_schedule.loan.control_number}</td>
//                 <td>{payment.payment_schedule.due_date}</td>
//                 <td>₱ {parseFloat(payment.payment_schedule.principal_amount).toFixed(2)}</td>
//                 <td>{payment.payment_schedule.service_fee_component}</td>
//                 <td>₱ {parseFloat(payment.payment_amount).toFixed(2)}</td>
//                 <td>
//                   {payment.date_paid
//                     ? new Date(payment.date_paid).toLocaleDateString()
//                     : 'Not Paid'}
//                 </td>
//                 <td>{payment.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No payments found.</p>
//       )}
//     </div>
//   );
// };

// export default MemberPayments;
// import React, { useState, useEffect } from "react";

// const Payments = ({ scheduleId }) => {
//   const [payments, setPayments] = useState([]);
//   const [error, setError] = useState(null);

//   // Function to fetch payments for a specific payment schedule
//   const fetchPayments = async (scheduleId) => {
//     try {
//       // Get the access token from localStorage
//       const accessToken = localStorage.getItem("accessToken");
      
//       // Make the fetch request to get payments
//       const response = await fetch(`http://localhost:8000/api/payments/by_schedule/${scheduleId}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,  // Include the token in the request header
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setPayments(data);  // Store the payments in state
//       } else {
//         setError("Error fetching payments.");
//       }
//     } catch (error) {
//       setError("Error fetching payments.");
//       console.error("Error fetching payments:", error);
//     }
//   };

//   // Fetch payments when the component mounts or the scheduleId changes
//   useEffect(() => {
//     if (scheduleId) {
//       fetchPayments(scheduleId);
//     }
//   }, [scheduleId]);

//   return (
//     <div>
//       <h2>Payments for Payment Schedule</h2>

//       {/* Display error if there is one */}
//       {error && <div className="error">{error}</div>}

//       {/* Display payments in a table */}
//       {payments.length > 0 ? (
//         <table>
//           <thead>
//             <tr>
//               <th>Loan Control Number</th>
//               <th>Due Date</th>
//               <th>Principal Amount</th>
//               <th>Interest Amount</th>
//               <th>Service Fee</th>
//               <th>Paid Amount</th>
//               <th>Date Paid</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {payments.map((payment) => (
//               <tr key={payment.id}>
//                 <td>{payment.payment_schedule.loan.control_number}</td>
//                 <td>{payment.payment_schedule.due_date}</td>
//                 <td>₱ {parseFloat(payment.payment_schedule.principal_amount).toFixed(2)}</td>
//                 <td>₱ {parseFloat(payment.payment_schedule.interest_amount).toFixed(2)}</td>
//                 <td>₱ {parseFloat(payment.payment_schedule.service_fee).toFixed(2)}</td>
//                 <td>₱ {parseFloat(payment.payment_amount).toFixed(2)}</td>
//                 <td>{payment.date_paid}</td>
//                 <td>{payment.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <div>No payments found for this schedule.</div>
//       )}
//     </div>
//   );
// };

// export default Payments;
// import React, { useState, useEffect } from "react";

// // Function to fetch payments for a specific payment schedule
// const fetchPayments = async (paymentScheduleId) => {
//   try {
//     // Get the access token from localStorage (assuming you stored it after login)
//     const accessToken = localStorage.getItem("accessToken");

//     // Construct the URL to fetch payments for the given payment schedule ID
//     const response = await fetch(`http://localhost:8000/api/payments/${paymentScheduleId}/`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     // Check if the response is OK
//     if (!response.ok) {
//       throw new Error("Failed to fetch payments");
//     }

//     // Parse the response as JSON
//     const paymentData = await response.json();

//     return paymentData; // Return the payment data

//   } catch (error) {
//     console.error("Error fetching payments:", error);
//     return []; // Return an empty array in case of error
//   }
// };

// // Payment List Component
// const PaymentList = ({ paymentScheduleId }) => {
//   const [payments, setPayments] = useState([]);
//   const [error, setError] = useState(null);

//   // Fetch payments when the component mounts or paymentScheduleId changes
//   useEffect(() => {
//     console.log("Payment Schedule ID:", paymentScheduleId);
//     const fetchPaymentData = async () => {
//       try {
//         const fetchedPayments = await fetchPayments(paymentScheduleId);

//         if (fetchedPayments.length === 0) {
//           setError("No payments found.");
//         } else {
//           setPayments(fetchedPayments);
//         }
//       } catch (error) {
//         setError("An error occurred while fetching payments.");
//       }
//     };

//     fetchPaymentData();
//   }, [paymentScheduleId]);

//   return (
//     <div>
//       <h3>Payments</h3>
//       {error && <p>{error}</p>}
//       <table>
//         <thead>
//           <tr>
//             <th>Loan Control Number</th>
//             <th>Due Date</th>
//             <th>Principal Amount</th>
//             <th>Interest Amount</th>
//             <th>Service Fee</th>
//             <th>Paid Amount</th>
//             <th>Date Paid</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {payments.length > 0 ? (
//             payments.map((payment) => (
//               <tr key={payment.id}>
//                 <td>{payment.payment_schedule.loan.control_number}</td>
//                 <td>{payment.payment_schedule.due_date}</td>
//                 <td>₱ {parseFloat(payment.payment_schedule.principal_amount).toFixed(2)}</td>
//                 <td>{payment.payment_schedule.service_fee_component}</td>
//                 <td>₱ {parseFloat(payment.payment_amount).toFixed(2)}</td>
//                 <td>{payment.date_paid}</td>
//                 <td>{payment.status}</td>
//               </tr>
//             ))
//           ) : (
//             <tr><td colSpan="8">No payments available</td></tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default PaymentList;

import React, { useState, useEffect } from "react";
import Topbar from './Topbar/Topbar';
import './Payments.css'

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch payments for the logged-in member's account number
  const fetchPayments = async () => {
    try {
      const accountNumber = localStorage.getItem("account_number");
      const accessToken = localStorage.getItem("accessToken");

      if (!accountNumber || !accessToken) {
        setError("Account number or access token missing.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/payments/by_account/?account_number=${accountNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error fetching payments.");
        if (response.status === 401) {
          // Handle unauthorized (e.g., token expired)
          localStorage.removeItem("accessToken");
          window.location.href = "/login"; // redirect to login page
        }
      }
    } catch (error) {
      setError("Error fetching payments.");
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments when the component mounts
  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div>
      <Topbar />
      <h2>Payments</h2>

      {/* Back Button */}
      <button onClick={() => window.history.back()}>Go Back</button>

      {/* Display loading indicator */}
      {loading && <div>Loading payments...</div>}

      {/* Display error if there is one */}
      {error && <div className="error">{error}</div>}

      {/* Display payments in a table */}
      {!loading && payments.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Loan Control Number</th>
              <th>Due Date</th>
              <th>Principal Amount</th>
              <th>Interest Amount</th>
              <th>Service Fee</th>
              <th>Paid Amount</th>
              <th>Date Paid</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.payment_schedule.loan.control_number}</td>
                <td>{payment.payment_schedule.due_date}</td>
                <td>
                  ₱{" "}
                  {parseFloat(payment.payment_schedule.principal_amount).toFixed(
                    2
                  )}
                </td>
                <td>
                  ₱{" "}
                  {parseFloat(payment.payment_schedule.interest_amount).toFixed(
                    2
                  )}
                </td>
                <td>
                  ₱ {parseFloat(payment.payment_schedule.service_fee).toFixed(2)}
                </td>
                <td>₱ {parseFloat(payment.payment_amount).toFixed(2)}</td>
                <td>{payment.date_paid}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <div>No payments found for your account.</div>
      )}
    </div>
  );
};

export default Payments;

