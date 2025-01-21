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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

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
      // Check for error response and provide a more detailed error message
      if (err.response && err.response.data) {
        setFormError(err.response.data.detail || 'Error adding member. Please try again.');
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
      console.error(err);  // For debugging purposes
    }
  };  

  // Function to open the modal
const openDeleteModal = (member) => {
  setMemberToDelete(member);
  setShowDeleteModal(true);
};

// Function to confirm deletion
const confirmDeleteMember = async () => {
  try {
    await axios.delete(`http://localhost:8000/members/${memberToDelete.memId}/`);
    setMembers(members.filter(member => member.memId !== memberToDelete.memId));
    setShowDeleteModal(false);
    setMemberToDelete(null);
  } catch (err) {
    setError('Error deleting member.');
    console.error(err);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.membersSection}>
      {showAddForm ? (
        <div className={styles.addMemberForm}>
          <h3 style={{fontSize: '26px', marginTop: '-40px', marginBottom: '10px'}}>{editingMember ? 'Edit Member' : 'Add Member'}</h3>
          {formError && <p className={styles.errorText}>{formError}</p>}

          <div style={{
            fontFamily: 'Arial, sans-serif',
            color: '#000',
            padding: '20px',
            width: '100%',
            boxShadow: '0px 0px 15px 0px rgb(154, 154, 154)',
            borderRadius: '5px',
            marginRight: '50px',
            marginLeft: '3px',
            boxSizing: 'border-box',
            height: '565px'
          }}>
            <div style={{ display: 'grid', gap: '5px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                
              <div style={{ flex: '1' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>First Name:</label>
              <input
                type="text"
                className="form-control"
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
                  <input type="text"
                  className="form-control"
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
                  <input type="text" 
                  className="form-control"
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
                  <input type="email"
                  className="form-control"
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
                  className="form-control"
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

              <div style={{ flex: '1', minWidth: '300px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Birth Place:</label>
                <input
                  type="text"
                  className="form-control"
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
                  className="form-control"
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
                  className="form-control"
                  placeholder="Zip Code"
                  name="zip_code"
                  value={editingMember?.zip_code || newMember.zip_code || '2616'}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                />
              </div>
            </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: '1' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Gender:</label>
                <select 
                  className="form-control"
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
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Civil Status:</label>
                <select 
                  className="form-control"
                  name="pstatus"
                  value={editingMember?.pstatus || newMember.pstatus || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                >
                  <option value="" disabled>Select Relationship Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="In a relationship">In a relationship</option>
                  <option value="Engaged">Engaged</option>
                  <option value="Baak">Baak</option>
                </select>
              </div>

              <div style={{ flex: '1' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Religion:</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Religion"
                  name="religion"
                  value={editingMember?.religion || newMember.religion || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                />
              </div>

              <div style={{ flex: '2' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Address:</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Address"
                  name="address"
                  value={editingMember?.address || newMember.address || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                />
              </div>

                <div style={{ flex: '1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold' , marginTop: '5px'}}>Phone Number:</label>
                  <input type="text" 
                  className="form-control"
                  placeholder="Phone Number"
                  name="phone_number"
                  value={editingMember?.phone_number || newMember.phone_number || ''}
                  onChange={(e) =>
                    handleInputChange(e, editingMember ? setEditingMember : setNewMember)
                  }
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px',marginTop: '-3px' }}>
                <label style={{ display: 'block', fontWeight: 'bold'}}>Height (cm)</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="Height"
                  name="height"
                  value={editingMember?.height || newMember.height || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>

              <div style={{ flex: '1 1 200px',marginTop: '-3px' }}>
                <label style={{ display: 'block', fontWeight: 'bold'}}>Weight (kg)</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="Weight"
                  name="weight"
                  value={editingMember?.weight || newMember.weight || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>
              <div style={{ flex: '1 1 200px',marginTop: '-3px' }}>
                <label style={{ display: 'block', fontWeight: 'bold'}}>Tax Identification Number:</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="TIN"
                  name="tin"
                  value={editingMember?.tin || newMember.tin || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>
              <div style={{ flex: '1 1 200px',marginTop: '5px' }}>
              <label style={{ display: 'block', fontWeight: 'bold'}}>Issued Government ID</label>
              <select 
                className="form-control"
                name="valid_id"
                value={editingMember?.valid_id || newMember.valid_id || ''}
                onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
              >
                <option value="" disabled>Select Valid ID</option>
                <option value="Philippine Passport">Philippine Passport</option>
                <option value="Driver's License">Driver's License</option>
                <option value="SSS ID">SSS ID</option>
                <option value="GSIS ID">GSIS ID</option>
                <option value="Postal ID">Postal ID</option>
                <option value="Voter's ID">Voter's ID</option>
                <option value="PhilHealth ID">PhilHealth ID</option>
                <option value="National ID">National ID</option>
              </select>
            </div>
              <div style={{ flex: '1 1 200px',marginTop: '-3px' }}>
                <label style={{ display: 'block', fontWeight: 'bold'}}>ID Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="ID Number"
                  name="id_no"
                  value={editingMember?.id_no || newMember.id_no || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
  {/* Annual Income */}
  <div style={{ flex: '1 1 30%', maxWidth: '300px' }}>
    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
      Annual Income
    </label>
    <input
      type="number"
      className="form-control"
      placeholder="Annual Income"
      name="ann_com"
      value={editingMember?.ann_com || newMember.ann_com || ''}
      onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
    />
  </div>

  {/* Membership in other Cooperatives */}
  <div style={{ flex: '1 1 30%', maxWidth: '300px' }}>
    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
      Membership in other Cooperatives
    </label>
    <input
      className="form-control"
      name="mem_co"
      placeholder="Cooperatives"
      value={editingMember?.mem_co || newMember.mem_co || ''}
      onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
    />
  </div>

  {/* Address of the Cooperative */}
  <div style={{ flex: '1 1 30%', maxWidth: '300px' }}>
    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
      Address of the Cooperative
    </label>
    <input
      type="text"
      className="form-control"
      placeholder="Address"
      name="address"
      value={editingMember?.address || newMember.address || ''}
      onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
    />
  </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 30%', maxWidth: '300px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
              Initial Deposit
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="Deposit"
              name="in_dep"
              value={editingMember?.in_dep || newMember.in_dep || ''}
              onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
            />
          </div>
        </div>
              
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {/* Beneficiaries Name 1 */}
            <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
              <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginTop: '-20px' }}>
                  Beneficiaries Name
                </label>
                <input
                  className="form-control"
                  name="co_maker"
                  placeholder="Beneficiaries Name 1"
                  value={editingMember?.co_maker || newMember.co_maker || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>
              
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginTop: '-20px' }}>
                  Relationship
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="relationship"
                  placeholder="Relationship"
                  value={editingMember?.relationship || newMember.relationship || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>

              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginTop: '-20px' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="form-control"
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
            </div>

            {/* Beneficiaries Name 2 */}
            <div style={{ display: 'flex', gap: '20px', width: '100%' }}>

              <div style={{ flex: '1 1 200px', minWidth: '200px',marginTop: '-35px' }}>
                <input
                  className="form-control"
                  name="co_maker2"
                  placeholder="Beneficiaries Name 2"
                  value={editingMember?.co_maker2 || newMember.co_maker2 || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>
              
              <div style={{ flex: '1', minWidth: '200px',marginTop: '-35px' }}>
                <input
                  type="text"
                  className="form-control"
                  name="relationship2"
                  placeholder="Relationship"
                  value={editingMember?.relationship2 || newMember.relationship2 || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>

              <div style={{ flex: '1', minWidth: '200px',marginTop: '-35px' }}>
                <input
                  type="date"
                  className="form-control"
                  placeholder="Birth Date"
                  name="birth_date2"
                  min="1980-01-01"
                  max="2005-12-31"
                  value={editingMember?.birth_date2 || newMember.birth_date2 || ''}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    const today = new Date();
                    let age = today.getFullYear() - selectedDate.getFullYear();
                    const monthDiff = today.getMonth() - selectedDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
                      age -= 1;
                    }

                    const updatedMember = editingMember
                      ? { ...editingMember, birth_date2: e.target.value, age: age > 0 ? age : '' }
                      : { ...newMember, birth_date2: e.target.value, age: age > 0 ? age : '' };

                    editingMember ? setEditingMember(updatedMember) : setNewMember(updatedMember);
                  }}
                />
              </div>
            </div>

            {/* Beneficiaries Name 3 */}
            <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
              <div style={{ flex: '1 1 200px', minWidth: '200px',marginTop: '-35px' }}>
                <input
                  className="form-control"
                  name="co_maker3"
                  placeholder="Beneficiaries Name 3"
                  value={editingMember?.co_maker3 || newMember.co_maker3 || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>
              
              <div style={{ flex: '1', minWidth: '200px',marginTop: '-35px'}}>
                <input
                  type="text"
                  className="form-control"
                  name="relationship3"
                  placeholder="Relationship"
                  value={editingMember?.relationship3 || newMember.relationship3 || ''}
                  onChange={(e) => handleInputChange(e, editingMember ? setEditingMember : setNewMember)}
                />
              </div>

              <div style={{ flex: '1', minWidth: '200px',marginTop: '-35px' }}>
                <input
                  type="date"
                  className="form-control"
                  placeholder="Birth Date"
                  name="birth_date3"
                  min="1980-01-01"
                  max="2005-12-31"
                  value={editingMember?.birth_date3 || newMember.birth_date3 || ''}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    const today = new Date();
                    let age = today.getFullYear() - selectedDate.getFullYear();
                    const monthDiff = today.getMonth() - selectedDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
                      age -= 1;
                    }

                    const updatedMember = editingMember
                      ? { ...editingMember, birth_date3: e.target.value, age: age > 0 ? age : '' }
                      : { ...newMember, birth_date3: e.target.value, age: age > 0 ? age : '' };

                    editingMember ? setEditingMember(updatedMember) : setNewMember(updatedMember);
                  }}
                />
              </div>
            </div>
          </div>
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
            <h2 style={{marginTop: '-10px',  padding: '20px', textAlign: 'center', color: 'black', fontSize: '30px'}}>MEMBERS</h2>
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
              borderRadius: '4px',
              width: '250px',
              marginLeft: '1005px',
              marginBottom: '30px',
              marginTop: '-10px',
              border: 'none'
            }}
        />                           
            </div>
            <button
                className={styles.addButton}
                onClick={() => setShowAddForm(true)}
                style={{
                  backgroundColor: '#28a745',
                  color: 'black',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  position: 'relative', 
                  marginRight: '1100px', 
                  marginTop: '-65px',
                  position: 'fixed'
              }}
            >
                <AiOutlineUsergroupAdd />Add Member
            </button>
        </div>
        <div
          style={{
            maxHeight: '425px',
            width: '100%',
            overflowY: 'auto',
            boxShadow: '0px 0px 15px 0px rgb(154, 154, 154)',
            marginTop: '20px',
            padding: '0px',
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
              marginTop: '0px',
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
                <th style={{ padding: '10px' }}>Account No.</th>
                <th style={{ padding: '10px'}}>Full Name</th>
                <th style={{ padding: '10px'}}>Email</th>
                <th style={{ padding: '10px'}}>Phone Number</th>
                <th style={{ padding: '10px'}}>Action</th>
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
                  <td style={{ padding: '10px',fontSize: '20px'}}>
                    {member.accountN || 'No Account'}
                  </td>
                  <td style={{ padding: '10px',  fontSize: '20px' }}>
                    {`${member.first_name} ${member.middle_name || ''} ${member.last_name}`.trim()}
                  </td>
                  <td style={{ padding: '10px'}}>{member.email}</td>
                  <td style={{ padding: '10px' }}>{member.phone_number}</td>
                  <td style={{ padding: '10px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                    <button
                      onClick={() => handleViewMember(member)}
                      style={{
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
                        padding: '5px 10px',
                        cursor: 'pointer',
                        color: 'black',
                        backgroundColor: 'DodgerBlue',
                        borderRadius: '5px',
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                    onClick={() => openDeleteModal(member)}
                    style={{
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

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <p>
                Are you sure you want to delete the member{' '}
                <strong>{memberToDelete?.first_name} {memberToDelete?.last_name}</strong>?
              </p>
              <div className="modal-actions">
                <button
                  onClick={confirmDeleteMember}
                  style={{
                    padding: '5px 10px',
                    color: 'black',
                    backgroundColor: '#f44336',
                    borderRadius: '5px',
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    padding: '5px 10px',
                    color: 'black',
                    backgroundColor: '#ccc',
                    borderRadius: '5px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Member Details Table */}
        {selectedMember && (
            <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '55%',
              transform: 'translate(-50%, -50%)',
              animation: 'popupAnimation 0.6s ease forwards',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              zIndex: 1000,
              width: '50%',
              maxHeight: '70%',
              overflowY: 'auto',
            }}
            
            >
              <h3 style={{ marginBottom: '10px', textAlign: 'center', color: 'black' }}>Member Details</h3>
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
                        textAlign: 'left',
                        backgroundColor: 'gray',
                        color: 'black',
                      }}
                    >
                      Field
                    </th>
                    <th
                      style={{
                        padding: '10px',
                        textAlign: 'left',
                        backgroundColor: 'gray',
                        color: 'black',
                      }}
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Account No.</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.accountN}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Full Name</strong>
                    </td>
                    <td style={{ padding: '10px' }}>
                    {`${selectedMember.first_name} ${selectedMember.middle_name || ''} ${selectedMember.last_name}`.trim()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Email</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.email}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Phone Number</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.phone_number}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Religion</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.religion}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Address</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.address}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Birth Date</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.birth_date}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Gender.</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.gender}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong> Civil Status.</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.pstatus}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Birth Place.</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.birth_place}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Age.</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.age}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Zip Code.</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.zip_code}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Height(cm)</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.height}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Weight(kg)</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.weight}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Annual Income</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.ann_com}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Tax Identification Number:</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.tin}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Issued Government ID</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.valid_id}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>ID Number</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.id_no}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Membership in other Cooperatives</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.mem_co}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Address of the Cooperative</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.address}
                    </td>
                    <td style={{ padding: '10px'}}>
                      <strong>Initial Deposit</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.in_dep}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Beneficiaries Name</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.co_maker}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Relationship with the Beneficiaries</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.relationship}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px'}}>
                      <strong>Birth Date</strong>
                    </td>
                    <td style={{ padding: '10px'}}>
                      {selectedMember.birth_date}
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


