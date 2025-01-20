import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../Topbar/Topbar';
import axios from 'axios';

const Home = () => {
  const [memberData, setMemberData] = useState(null);
  const [updatedMemberData, setUpdatedMemberData] = useState({});
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // State to toggle edit mode
  const [selectedProfile, setSelectedProfile] = useState(null); // State for selected profile file
  const [profilePreview, setProfilePreview] = useState(null); // State for profile preview
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


  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedProfile(file);
      setProfilePreview(URL.createObjectURL(file)); // Show preview locally

      try {
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('profile_picture', file);

        const response = await axios.post('http://localhost:8000/api/member/upload-profile-picture/', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });

        // Update profile picture URL in state
        setMemberData((prevData) => ({
          ...prevData,
          profile_picture: response.data.profile_picture,
        }));
        alert('Profile picture updated successfully!');
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to upload profile picture.');
      }
    }
  };

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
          backgroundColor: '#f0f0f0',
          height: '100%',
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
              borderRadius: '8px',
              width: '700px',
              padding: '20px',
              height: '500px',
              boxShadow: '0px 4px 20px rgba(187, 186, 186, 0.99)',
            }}
          >
            <h3
              style={{
                fontWeight: 'bold',
                color: 'black',
                borderBottom: '2px solid rgb(133, 133, 132)',
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
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <label
                htmlFor="profileInput"
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: 'blue',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Choose Profile
              </label>
              <input
                type="file"
                id="profileInput"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }} // Hide the input element
              />
            </div>
            {profilePreview && (
              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '18px' }}>
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  style={{
                    height: '300px',
                    width: '55%',      
                    borderRadius: '8px',
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Card */}
          <div
            style={{
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              width: '600px',
              padding: '20px',
              boxShadow: '0px 4px 20px rgba(187, 186, 186, 0.99)',
              height: '400px',
            }}
          >
            <h3 style={{ textAlign: 'center', color: 'black', fontSize: '30px', marginTop: '-10px' }}>
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
                  <button
                    onClick={() => {
                      setUpdatedMemberData(memberData); // Reset data to original
                      setIsEditMode(false); // Exit edit mode
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '18px',
                    }}
                  >
                    Cancel
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
