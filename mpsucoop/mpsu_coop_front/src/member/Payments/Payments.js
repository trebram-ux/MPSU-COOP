import React, { useEffect, useState } from 'react';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);  // Added loading state
  const accountNumber = localStorage.getItem('accountN');  // Or however you're storing it

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const accountNumber = localStorage.getItem('accountN');
        const token = localStorage.getItem('accessToken');

        if (!accountNumber || !token) {
          throw new Error("Missing account number or access token");
        }

        const response = await fetch(`http://127.0.0.1:8000/api/payments/by-account/?account_number=${accountNumber}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorMessage = `Error fetching payments: ${response.status} ${response.statusText}`;
          setError(errorMessage);
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setPayments(data);  // Set the payments data
        }
      } catch (error) {
        console.error("Error in fetchPayments:", error);
        setError(error.message);  // Set error message on failure
      } finally {
        setLoading(false);  // Set loading to false once the API request is done
      }
    };

    fetchPayments();
  }, [accountNumber]);

  return (
    <div>
      {loading ? (
        <p>Loading payments...</p>  // Show loading message while fetching data
      ) : error ? (
        <p>{error}</p>  // Show error message if there's an issue
      ) : (
        <table>
          <thead>
            <tr>
              <th>Principal Amount</th>
              <th>Interest</th>
              <th>Service Fee</th>
              <th>Paid Amount</th>
              <th>Date Paid</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>₱ {(parseFloat(payment.principal_amount) || 0).toFixed(2)}</td>
                  <td>₱ {(parseFloat(payment.interest_amount) || 0).toFixed(2)}</td>
                  <td>₱ {(parseFloat(payment.service_fee_component) || 0).toFixed(2)}</td>
                  <td>₱ {(parseFloat(payment.payment_amount) || 0).toFixed(2)}</td>
                  <td>{new Date(payment.due_date).toLocaleDateString()}</td>
                  <td>₱ {(parseFloat(payment.balance) || 0).toFixed(2)}</td>
                  <td style={{ color: payment.status === 'Paid' ? 'green' : 'red' }}>
                    {payment.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7">No payments found for this account.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Payments;
