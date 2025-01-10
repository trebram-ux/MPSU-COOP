import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPassword = e.target.password.value;

    try {
      const response = await fetch(`http://localhost:8000/reset-password/${uid}/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }

      alert('Password reset successful');
      navigate('/');  // Navigate to the home page after success
    } catch (err) {
      console.error(err.message);
      alert('Error resetting password');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="password" name="password" placeholder="Enter new password" required />
      <button type="submit">Reset Password</button>
    </form>
  );
}

export default ResetPassword;
