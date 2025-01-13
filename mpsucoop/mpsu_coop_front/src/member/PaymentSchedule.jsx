import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from './Topbar/Topbar';

const PaymentSchedule = () => {
  const { control_number } = useParams(); 
  const [paymentSchedules, setPaymentSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();  

  useEffect(() => {
    const fetchPaymentSchedules = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`http://localhost:8000/api/payment-schedules/${control_number}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch payment schedules.");
        }

        const data = await response.json();
        setPaymentSchedules(data);
        setLoading(false);
      } catch (err) {
        setError("Unable to load payment schedules.");
        setLoading(false);
      }
    };

    fetchPaymentSchedules();
  }, [control_number]);

  if (loading) {
    return <div>Loading payment schedules...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', marginTop: '220px' }}>
      <Topbar />
      <h2 style={{ textAlign: 'center', color: 'black' }}>MY PAYMENT SCHEDULES</h2>

      <button 
        onClick={() => navigate(-1)} 
        style={{
          backgroundColor: 'red',
          padding: '10px 15px',
          border: '1px solid black',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '20px',
        }}>
        Back
      </button>

      {paymentSchedules.length > 0 ? (
        <div 
          style={{
            overflowY: 'auto', 
            maxHeight: '400px', 
            border: '2px solid black', 
            borderRadius: '5px', 
            padding: '10px',
            marginTop: '10px',
            width: '150%',
            marginLeft: '-25%',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'red' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Due Date</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Principal Amount</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Interest Amount</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Service Fee</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Amount Due</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentSchedules.map((schedule) => (
                <tr key={schedule.id} style={{ color: 'black' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{schedule.due_date}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{schedule.principal_amount}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{schedule.interest_amount}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{schedule.service_fee_component}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{schedule.payment_amount || "N/A"}</td>
                  <td 
                    style={{
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      color: schedule.is_paid ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}
                  >
                    {schedule.is_paid ? "Paid" : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ marginTop: '20px', fontSize: '16px', color: '#555' }}>No payment schedules found for this loan.</div>
      )}
    </div>
  );
};

export default PaymentSchedule;
