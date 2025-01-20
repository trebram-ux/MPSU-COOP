import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from './Topbar/Topbar';

const PaymentSchedule = () => {
  const { control_number } = useParams();
  const [paymentSchedules, setPaymentSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formatNumber = (number) => {
    if (number == null || isNaN(number)) return "N/A";
    return new Intl.NumberFormat('en-US').format(number);
  };

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
        // Filter out paid schedules
        const unpaidSchedules = data.filter(schedule => !schedule.is_paid);
        setPaymentSchedules(unpaidSchedules);
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
      <h2 style={{
          textAlign: 'center',
          color: '#000000',
          fontSize: '30px',
          marginBottom: '50px',
          marginTop: '-150px',
        }}
        >MY PAYMENT SCHEDULES</h2>

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
          marginBottom: '15px',
          marginLeft: '-500px'
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#ff00e1')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#37ff7d')}
      >
        Back
      </button>

      {paymentSchedules.length > 0 ? (
        <div 
          style={{
            maxHeight: '460px',
              width: '360%',
              overflowY: 'auto',
              boxShadow: '0px 0px 15px 0px rgb(154, 154, 154)',
              marginTop: '20px',
              padding: '5px',
              borderRadius: '5px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              marginLeft: '-500px'
          }}>
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
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{formatNumber(schedule.principal_amount)}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{formatNumber (schedule.interest_amount)}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{formatNumber (schedule.service_fee)}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{formatNumber (schedule.payment_amount || "N/A")}</td>
                  <td 
                    style={{
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      color: schedule.is_paid ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}>
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
