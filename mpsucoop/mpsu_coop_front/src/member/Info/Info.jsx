import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../Topbar/Topbar';
import axios from 'axios';
import { Link } from "react-router-dom";

const Home = () => {
  const [memberData, setMemberData] = useState(null);
  const [updatedMemberData, setUpdatedMemberData] = useState({});
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // State to toggle edit mode
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('No authentication token found. Please log in again.');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/member/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMemberData(response.data);
        setUpdatedMemberData(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch data.');
      }
    };

    fetchMemberDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedMemberData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      await axios.put(
        'http://localhost:8000/api/member/profile/',
        updatedMemberData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMemberData(updatedMemberData);
      alert('Changes saved successfully!');
      setIsEditMode(false); // Exit edit mode after saving
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save changes.');
    }
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p>{error}</p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!memberData) return <p>Loading...</p>;

  return (
    <div>
      <Topbar />
      <div
        style={{
          backgroundColor: '#D5ED9F',
          height: '80vh',
          width: '100%',
          fontFamily: 'Arial, sans-serif',
          color: 'black',
        }}
      >


          <div
            style={{
              display: 'flex',
              gap: '60px',
              marginTop: '60px',
              justifyContent: 'center',
            }}
          >
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

            </div>

 {/* Right Card */}
<div
  style={{
    height: '100%',
    backgroundColor: '#c8f7ce',
    borderRadius: '8px',
    width: '600px',
    padding: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    marginTop: '0px',
  }}
>
  <h3 style={{ textAlign: 'center', color: 'black', fontSize: '30px' }}>
    {isEditMode ? 'Edit Information' : 'Member Information'}
  </h3>
  <div style={{ marginTop: '20px' }}>
    {/* Render only specific fields in pairs */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
      {['first_name', 'middle_name', 'last_name', 'email', 'phone_number', 'address', 'status'].map((key) => (
        <div
          key={key}
          style={{
            flex: '1 1 calc(50% - 20px)',
            marginBottom: '10px',
          }}
        >
          <label>
            {key.replace('_', ' ').toUpperCase()}:
            <input
              type="text"
              name={key}
              value={updatedMemberData[key] || ''}
              readOnly={!isEditMode}
              onChange={handleInputChange}
              style={{
                display: 'block',
                width: '100%',
                backgroundColor: isEditMode ? '#fff' : '#e9ecef',
                border: isEditMode ? '1px solid #ced4da' : 'none',
                padding: '8px',
                borderRadius: '4px',
              }}
            />
          </label>
        </div>
      ))}
    </div>

    {/* Reset Password Link */}
    {/* <div
    style={{
        textAlign: 'center',
        marginTop: '10px',
    }}
    >
    <Link
        to='/reset-password/'
        style={{
        color: '#007bff',
        textDecoration: 'underline',
        fontSize: '16px',
        }}
    >
        Reset Password
    </Link>
    </div> */}


    {isEditMode ? (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleSaveChanges}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            marginRight: '10px',
          }}
        >
          Save Changes
        </button>
      </div>
    ) : (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => setIsEditMode(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
          }}
        >
          Edit Information
        </button>
      </div>
    )}
  </div>
</div>



          </div>
      </div>
    </div>
  );
};

export default Home;
