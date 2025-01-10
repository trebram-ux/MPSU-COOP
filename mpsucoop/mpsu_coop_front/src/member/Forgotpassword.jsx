import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Email sent:", email); // Debug email
  
    try {
      const response = await fetch('http://localhost:8000/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // Ensure the 'email' is correctly passed here
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
  
      const data = await response.json();
      setMessage(data.message);
      setEmail('');
  
      // Ensure that both uid and token are available
      const { uid, token } = data;
      if (uid && token) {
        // Navigate to reset password page with token
        navigate(`/reset-password/${uid}/${token}`);
      } else {
        throw new Error('Invalid response: Missing uid or token');
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  

  return (
    <div>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default ForgotPassword;
