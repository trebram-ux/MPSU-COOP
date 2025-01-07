import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './login.css';

function Login() {
  const [account_number, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(''); // To manage role selection
  const navigate = useNavigate();

  // Handle role selection (Admin or Member)
  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
  };

  // Back to role selection screen
  const handleBackToRoleSelection = () => {
    setRole('');
    setShowSignup(false);
    setError('');
  };

  // Member login handler
  const handleMemberLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const credentials = { account_number, password };

    try {
      const response = await fetch('http://localhost:8000/login/member/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      console.log('Member login successful');
      navigate('/home');  
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // const token = localStorage.getItem('accessToken');  // Retrieve token

  // const fetchProfile = async () => {
  //     try {
  //         const response = await fetch('http://localhost:8000/api/member/profile/', {
  //             method: 'GET',
  //             headers: {
  //                 'Authorization': `Bearer ${token}`,  // Add token in Authorization header
  //                 'Content-Type': 'application/json',
  //             },
  //         });
  
  //         if (!response.ok) {
  //             const errorData = await response.json();
  //             throw new Error(errorData.detail || 'Unauthorized');
  //         }
  
  //         const profileData = await response.json();
  //         console.log(profileData);  // Log profile data
  //     } catch (error) {
  //         console.error('Error:', error.message);
  //     }
  // };
//   const refreshToken = async () => {
//     const refreshToken = localStorage.getItem('refreshToken');

//     try {
//         const response = await fetch('http://localhost:8000/token/refresh/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ refresh: refreshToken }),
//         });

//         const data = await response.json();
//         localStorage.setItem('accessToken', data.access);  // Update token
//     } catch (error) {
//         console.error('Token refresh failed:', error);
//     }
// };
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch('/protected-endpoint/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      console.error('Failed to fetch protected data.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const credentials = { username, password };

    try {
      const response = await fetch('http://localhost:8000/login/admin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      console.log('Admin login successful');
      navigate('/admin-dashboard');  // Redirect to admin dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Signup handler for member registration
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const signupData = {
      account_number,
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      console.log('Signup successful');
      setShowSignup(false);
      navigate('/'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to signup form
  const handleNavigateToSignup = (e) => {
    e.preventDefault();
    setShowSignup(true);
  };

  return (
    <div className="lcontainer">
      <div className="background"></div>
      <div className="login-box">
        <div className="login-container">
          <h1>MPSU Employees Credit Cooperative</h1>
          {!role ? (
            <div className="role-selection">
              <p>Who is signing in?</p>
              <button onClick={() => handleRoleSelection('member')} className="btn btn-primary">
                Member
              </button>
              <button onClick={() => handleRoleSelection('admin')} className="btn btn-secondary">
                Admin
              </button>
            </div>
          ) : role === 'member' ? (
            <div className="card-body">
              {!showSignup ? (
                <form onSubmit={handleMemberLoginSubmit} className="form">
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Account Number"
                      value={account_number}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button type="submit" className="btn btn-primary">
                    <i className="fa fa-unlock"></i> {loading ? 'Logging in...' : 'Log in'}
                  </button>
                  <button onClick={handleBackToRoleSelection} className="btn btn-secondary">
                    <i className="fa fa-arrow-left"></i> Back
                  </button>
                  <p>
                    Don't have an account?{' '}
                    <a href="#" onClick={handleNavigateToSignup} id="crt">
                      Create an Account
                    </a>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit}>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Account Number"
                      value={account_number}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button type="submit" className="btn btn-primary">
                    <i className="fa fa-user-plus"></i> {loading ? 'Signing up...' : 'Sign Up'}
                  </button>
                  <button onClick={handleBackToRoleSelection} className="btn btn-secondary">
                    <i className="fa fa-arrow-left"></i> Back
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="card-body">
              <form onSubmit={handleLoginSubmit}>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button type="submit" className="btn btn-secondary">
                    <i className="fa fa-unlock"></i> {loading ? 'Logging in...' : 'Log in'}
                  </button>
                  <button onClick={handleBackToRoleSelection} className="btn btn-secondary">
                    <i className="fa fa-arrow-left"></i> Back
                  </button>
                </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
