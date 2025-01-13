import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import styles from './Members.css';
// import MembershipForm from './MembershipForm';
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaEdit, FaTrash, FaEye} from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { FaSearch } from 'react-icons/fa';
import { SiFormspree } from "react-icons/si";

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [newMember, setNewMember] = useState({});
  const [editingMember, setEditingMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');  // State for search query

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/members/');
        setMembers(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

   // Filter members based on the search query
   const filteredMembers = members.filter(member => 
    `${member.first_name} ${member.middle_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.accountN && member.accountN.toString().includes(searchQuery)  // Account number search
  );

  const handleInputChange = (e, setter) => {
    setter(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  };  

  const handleAddMember = async () => {
    if (!newMember.first_name || !newMember.last_name) {
      setFormError('First and last names are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/members/', newMember);
      setMembers([...members, response.data]);
      setNewMember({});
      setShowAddForm(false);  
      setFormError(null);
    } catch (err) {
      setFormError('Error adding member. Please try again.');
    }
  };

  const handleDeleteMember = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this member?');
    if (!confirmDelete) return; // Exit the function if the user cancels the deletion
    
    const memberToDelete = members.find((member) => member.memId === id);
    if (!memberToDelete) {
      console.log(`Member with ID ${id} not found.`);
      return; // If the member doesn't exist, exit the function
    }
  
    try {
      console.log(`Deleting member with ID: ${id}`);
      // Delete the member directly from the backend
      await axios.delete(`http://localhost:8000/members/${id}/`);
  
      // Update the state to remove the member from the list
      setMembers(members.filter((member) => member.memId !== id));
    } catch (err) {
      console.error('Error deleting member:', err.response || err.message || err); // More detailed error info
      setError('Error deleting member.');
    }
  };

  const handleEditMember = async () => {
    if (!editingMember.first_name || !editingMember.last_name) {
      setFormError('First and last names are required.');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/members/${editingMember.memId}/`,
        editingMember
      );
      setMembers(
        members.map(member =>
          member.memId === editingMember.memId ? response.data : member
        )
      );
      setEditingMember(null); 
      setShowAddForm(false);  
      setFormError(null);
    } catch (err) {
      setFormError('Error updating member. Please try again.');
    }
  };

  const handleStartEdit = (member) => {
    setEditingMember({ ...member });  
    setShowAddForm(true);  
  };

  // Set the selected member when "View" button is clicked
  const handleViewMember = (member) => {
    setSelectedMember(member);
  };

  // const handlePrintMemberForm = (member) => {
  //   // Create a new window for printing
  //   const printWindow = window.open('', '_blank', 'width=800,height=600', 'position=center');

  //   // Render the MembershipForm component in the new window
  //   printWindow.document.write(`
  //     <!DOCTYPE html>
  //     <html>
  //       <head>
  //         <title>Print Membership Form</title>
  //       </head>
  //       <body>
  //         <div id="print-content"></div>
  //         <script src="https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js"></script>
  //         <script src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js"></script>
  //       </body>
  //     </html>
  //   `);

  //   // Set up the MembershipForm with prefilled data from the `member`
  //   ReactDOM.render(
  //     <MembershipForm prefilledData={member} />,
  //     printWindow.document.getElementById('print-content')
  //   );

  //   // Trigger print after rendering
  //   printWindow.document.close();
  //   printWindow.focus();
  //   printWindow.print();
  // };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.membersSection}>
      {showAddForm ? (
        <div className={styles.addMemberForm}>
          <h3>{editingMember ? 'Edit Member' : 'Add Member'}</h3>
          {formError && <p className={styles.errorText}>{formError}</p>}

          <div style={{
            fontFamily: 'Arial, sans-serif',
            color: '#000',
            padding: '20px',
            width: '100%',
            border: '1px solid #000',
            borderRadius: '5px',
            marginRight: '50px',
            boxSizing: 'border-box',
            height: '100%'
          }}>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                
                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>First Name:</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  id="first_name"
                  placeholder="First Name"
                  name="first_name"
                  value={editingMember?.first_name || newMember.first_name || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                  />
                </div>
                
                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Middle Name:</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="Middle Name"
                  name="middle_name"
                  value={editingMember?.middle_name || newMember.middle_name || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                  />
                </div>
                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Last Name:</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="last Name"
                  name="last_name"
                  value={editingMember?.last_name || newMember.last_name || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                  />
                </div>

                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Email Address:</label>
                  <input type="email" style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="Email"
                  name="email"
                  value={editingMember?.email || newMember.email || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Date of Birth:</label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #000',
                    borderRadius: '3px',
                  }}
                  placeholder="Birth Date"
                  name="birth_date"
                  min="1980-01-01"
                  max="2005-12-31"
                  value={editingMember?.birth_date || newMember.birth_date || ''}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    const today = new Date();
                    let age = today.getFullYear() - selectedDate.getFullYear();
                    const monthDiff = today.getMonth() - selectedDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
                      age -= 1;
                    }

                    const updatedMember = editingMember
                      ? { ...editingMember, birth_date: e.target.value, age: age > 0 ? age : '' }
                      : { ...newMember, birth_date: e.target.value, age: age > 0 ? age : '' };

                    editingMember ? setEditingMember(updatedMember) : setNewMember(updatedMember);
                  }}
                />
              </div>

              <div style={{ flex: '2', minWidth: '300px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Birth Place:</label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #000',
                    borderRadius: '3px',
                  }}
                  placeholder="Birth Place"
                  name="birth_place"
                  value={editingMember?.birth_place || newMember.birth_place || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                />
              </div>

              <div style={{ flex: '1', minWidth: '100px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Age:</label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #000',
                    borderRadius: '3px',
                  }}
                  placeholder="Age"
                  name="age"
                  value={editingMember?.age || newMember.age || ''}
                  readOnly
                />
              </div>

              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Zip Code:</label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #000',
                    borderRadius: '3px',
                  }}
                  placeholder="Zip Code"
                  name="zip_code"
                  value={editingMember?.zip_code || newMember.zip_code || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                />
              </div>
            </div>
            </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Gender:</label>
                  <select style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  name="gender"
                  value={editingMember?.gender || newMember.gender || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                  >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                  </select>
                  </div>

                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Civil Status:</label>
                  <select style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  name="pstatus"
                  value={editingMember?.pstatus || newMember.pstatus || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                >
                    <option value="" disabled>Select Relationship Status</option> {/* Optional placeholder */}
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="In a relationship">In a relationship</option>
                    <option value="Engaged">Engaged</option>
                    <option value="Baak">Baak</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Religion:</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="Religion"
                  name="religion"
                  value={editingMember?.religion || newMember.religion || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                  />
                </div>
                <div style={{ flex: '2' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Address:</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="Address"
                  name="address"
                  value={editingMember?.address || newMember.address || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                  />
                </div>
                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' }}>Phone Number:</label>
                  <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="Phone Number"
                  name="phone_number"
                  value={editingMember?.phone_number || newMember.phone_number || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>Height (cm)</label>
                <input 
                  type="number" 
                  style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="Height"
                  name="height"
                  value={editingMember?.height || newMember.height || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>Weight (kg)</label>
                <input 
                  type="number" 
                  style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="Weight"
                  name="weight"
                  value={editingMember?.weight || newMember.weight || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>Annual Income</label>
                <input 
                  type="number" 
                  style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="Annual Income"
                  name="ann_com"
                  value={editingMember?.ann_com || newMember.ann_com || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Issued Government ID</label>
              <select 
                style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                name="valid_id"
                value={editingMember?.valid_id || newMember.valid_id || ''}
                onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
              >
                <option value="" disabled>Select Valid ID</option>
                <option value="Philippine Passport">Philippine Passport</option>
                <option value="Driver's License">Driver's License</option>
                <option value="SSS ID">SSS ID</option>
                <option value="GSIS ID">GSIS ID</option>
                <option value="TIN ID">TIN ID</option>
                <option value="Postal ID">Postal ID</option>
                <option value="Voter's ID">Voter's ID</option>
                <option value="PhilHealth ID">PhilHealth ID</option>
                <option value="National ID">National ID</option>
              </select>
            </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>ID Number</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '8px', border: '1px solid #000', borderRadius: '3px' }}
                  placeholder="ID Number"
                  name="id_no"
                  value={editingMember?.id_no || newMember.id_no || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>
            </div>
            </div>

           {/* Buttons */}
           <button onClick={editingMember ? handleEditMember : handleAddMember}>
            {editingMember ? 'Save Changes' : 'Submit'}
          </button>
          <button onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>

      ) : (
  
        <>
        <div className={styles.tableHeader}>
            <h2 style={{ width: '97%', marginTop: '-10px',  padding: '20px', textAlign: 'center', borderBottom: '2px solid #000000', color: 'black'}}>MEMBERS</h2>
            {/* <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Prevent default link behavior
              handlePrintMemberForm();
            }}
            style={{
              padding: '5px',
              cursor: 'pointer',
              color: 'black',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'goldenrod'; 
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'black';
            }}
          >
            <SiFormspree /><strong>Membership Form</strong>
          </a> */}

          <div className={styles.searchBar} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <input
            type="text"
            placeholder="Search Members"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '7px 40px 10px 10px',
              fontSize: '16px',
              border: '2px solid #000',
              borderRadius: '4px',
              width: '250px',
              marginLeft: '1005px',
              marginBottom: '30px',
              marginTop: '-10px',
            }}
        />
        <button
            onClick={() => console.log('Search triggered')}
            style={{
              position: 'absolute',
              top: '-14px',
              fontSize: '12px',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'black',
              border: '2px solid #000000',
              borderRadius: '4px',
              padding: '10px',
              marginLeft: '1255px',
          }}
          >
            <FaSearch />
        </button>                           
            </div>
            
            <button
                className={styles.addButton}
                onClick={() => setShowAddForm(true)}
                style={{
                  backgroundColor: '#28a745',
                  color: 'black',
                  padding: '10px 20px',
                  border: '2px solid #000000',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  position: 'relative', 
                  marginLeft: '1140px', 
                  marginBottom: '0px'
              }}
            >
                <AiOutlineUsergroupAdd />Add Member
            </button>
        </div>

        <div
          style={{
            maxHeight: '425px',
            width: '99%',
            overflowY: 'auto',
            border: '2px solid black',
            marginTop: '20px',
            padding: '5px',
            borderRadius: '5px',
            scrollbarWidth: 'none', // For Firefox
            msOverflowStyle: 'none', // For IE and Edge
          }}
        >
          <style>
            {`
              /* For WebKit-based browsers (Chrome, Safari, etc.) */
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: '20px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: 'red',
                  color: 'black',
                  position: 'sticky',
                  top: '-7px',
                  zIndex: '1',
                }}
              >
                <th style={{ padding: '10px', border: '2px solid black' }}>Account No.</th>
                <th style={{ padding: '10px', border: '2px solid black' }}>Full Name</th>
                <th style={{ padding: '10px', border: '2px solid black' }}>Email</th>
                <th style={{ padding: '10px', border: '2px solid black' }}>Phone Number</th>
                <th style={{ padding: '10px', border: '2px solid black' }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.memId}
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <td style={{ padding: '10px', border: '2px solid black', fontSize: '20px'}}>
                    {member.accountN || 'No Account'}
                  </td>
                  <td style={{ padding: '10px', border: '2px solid black', fontSize: '20px' }}>
                    {`${member.first_name} ${member.middle_name || ''} ${member.last_name}`.trim()}
                  </td>
                  <td style={{ padding: '10px', border: '2px solid black', fontSize: '20px' }}>{member.email}</td>
                  <td style={{ padding: '10px', border: '2px solid black', fontSize: '20px' }}>{member.phone_number}</td>
                  <td style={{ padding: '10px', border: '1px solid black', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                    <button
                      onClick={() => handleViewMember(member)}
                      style={{
                        border: '2px solid #000',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        color: 'black',
                        backgroundColor: 'DodgerBlue',
                        borderRadius: '5px',
                      }}
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => handleStartEdit(member)}
                      style={{
                        border: '2px solid #000',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        color: 'black',
                        backgroundColor: '#ffc107',
                        borderRadius: '5px',
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.memId)}
                      style={{
                        border: '2px solid #000',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        color: 'black',
                        backgroundColor: '#f44336',
                        borderRadius: '5px',
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Member Details Table */}
        {selectedMember && (
            <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '55%',
              transform: 'translate(-50%, -50%)',
              animation: 'popupAnimation 0.6s ease forwards',
              backgroundColor: '#76ab87',
              border: '2px solid black',
              borderRadius: '8px',
              padding: '20px',
              zIndex: 1000,
              width: '50%',
              maxHeight: '70%',
              overflowY: 'auto',
            }}
            
            >
              <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>Member Details</h3>
              <button
                onClick={() => setSelectedMember(null)}
                style={{
                  backgroundColor: '#ff4d4d',
                  color: 'black ',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                }}
              >
                <IoMdCloseCircle style={{ marginRight: '5px' }} /> Close
              </button>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        backgroundColor: '#007bff',
                        color: 'black',
                        border: '2px solid black',
                      }}
                    >
                      Field
                    </th>
                    <th
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        backgroundColor: '#007bff',
                        color: 'black',
                        border: '2px solid black',
                      }}
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Account No.</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.accountN}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Full Name</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                    {`${selectedMember.first_name} ${selectedMember.middle_name || ''} ${selectedMember.last_name}`.trim()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Email</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.email}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Phone Number</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.phone_number}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Religion</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.religion}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Address</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.address}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Birth Date</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.birth_date}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Gender.</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.gender}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong> Civil Status.</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.pstatus}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Birth Place.</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.birth_place}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Age.</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.age}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Zip Code.</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.zip_code}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Height(cm)</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.height}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Weight(kg)</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.weight}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Annual Income</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.ann_com}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>Valid ID</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.valid_id}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      <strong>ID Number</strong>
                    </td>
                    <td style={{ padding: '10px', border: '2px solid black' }}>
                      {selectedMember.id_no}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          )}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              display: selectedMember ? 'block' : 'none',
            }}
            onClick={() => setSelectedMember(null)}
          ></div>
      </>
    )}
  </div>
);
}
export default Members;
