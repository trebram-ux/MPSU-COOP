import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Usermgmt.css'; 

const AdminMemberManagement = () => {
    const [members, setMembers] = useState([]);
    const [editMode, setEditMode] = useState(null);  // Track the member being edited
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    // Fetch all members on component mount
    useEffect(() => {
        axios.get(`http://localhost:8000/members/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => {
            console.log('Fetched members:', response.data);
            setMembers(response.data);
        })
        .catch(error => {
            console.error('Error fetching members:', error);
        });
    }, []);

    // Handle the toggle for editing a member
    const handleEditToggle = (memberId) => {
        setEditMode(memberId); // Set the member being edited
        const member = members.find(member => member.id === memberId); // Find the correct member based on the ID

        if (member) {
            console.log('Selected member for edit:', member); // Log selected member for debugging
            setFormData({
                username: member.user ? member.user.username : '',
                email: member.user ? member.user.email : '',
                password: member.user.password ? member.user.password : '',  
            });
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission for editing member
    const handleSubmit = (e, memberId) => {
        e.preventDefault();
        console.log('Form data being submitted:', formData);

        axios.put(`http://localhost:8000/members/${memberId}/`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => {
            setMembers(members.map(member => member.id === memberId ? response.data : member));
            setEditMode(null);
        })
        .catch(error => {
            console.error('Error updating member:', error);
        });
    };

    // Handle member deletion
    const handleDelete = (memberId, userId) => {
      if (window.confirm('Are you sure you want to delete the associated user account (username, email, password) for this member? This will not delete the member record itself.')) {
          // Send DELETE request to delete the user associated with the member
          axios.delete(`http://localhost:8000/users/${userId}/`, {  // Change this URL to the correct endpoint for the User model
              headers: {
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
          })
          .then(() => {
              // Update the member data, removing user data from the UI
              setMembers(members.map(member => 
                  member.memId === memberId ? { ...member, user: null } : member
              ));
          })
          .catch(error => {
              console.error('Error deleting user:', error);
          });
      }
  };
  
  

    return (
        <div className="member-management-container">
            <h2>Member Management</h2>
            <div className="table-container">
                <table className="member-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Password</th> {/* Display Password column */}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      {members.map(member => {
                          const fullName = `${member.first_name} ${member.middle_name ? member.middle_name + ' ' : ''}${member.last_name}`;
                          
                          return (
                              <tr key={member.memId}> {/* Use a unique key here */}
                                  <td>{fullName}</td>
                                  <td>{member.user ? member.user.username : 'N/A'}</td>
                                  <td>{member.user ? member.user.email : 'N/A'}</td>
                                  <td>{member.user && member.user.password ? member.user.password : 'N/A'}</td>
                                  <td>
                                      <button onClick={() => handleEditToggle(member.memId)}>Edit</button>
                                      <button onClick={() => handleDelete(member.memId)}>Delete</button>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
                </table>
            </div>
            {editMode !== null && (
                    <div className="edit-member-form">
                        <h3>Edit Member</h3>
                        <form onSubmit={(e) => handleSubmit(e, members.find(member => member.memId === editMode).memId)}>
                            <div>
                                <label>Username:</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}  // Make sure the value is correctly set
                                    onChange={handleInputChange}  // Optional, but necessary for other fields
                                    required
                                    readOnly  // Makes the username field readonly
                                />
                            </div>
                            <div>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password (leave blank to keep unchanged)"
                                />
                            </div>
                            <button type="submit">Save Changes</button>
                            <button type="button" onClick={() => setEditMode(null)}>Cancel</button>
                        </form>
                    </div>
                )}
        </div>
    );
};

export default AdminMemberManagement;
