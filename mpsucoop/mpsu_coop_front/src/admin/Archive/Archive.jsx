import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import './Archive.css';  // Assuming you'll use a separate CSS file for better styling management

const ArchivedRecords = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [archivedLoans, setArchivedLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch archived members
    axios.get('http://localhost:8000/archives/?archive_type=Member')
      .then(response => {
        setArchivedUsers(response.data || []);
      })
      .catch(error => {
        console.error('There was an error fetching archived members:', error);
      });

    // Fetch archived loans
    axios.get('http://localhost:8000/archives/?archive_type=Loan')
      .then(response => {
        setArchivedLoans(response.data || []);
      })
      .catch(error => {
        console.error('There was an error fetching archived loans:', error);
      });
  }, []);

  // Filter archived users based on search term
  const filteredUsers = Array.isArray(archivedUsers) ? archivedUsers.filter(user =>
    (user.archived_data.first_name && user.archived_data.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.archived_data.last_name && user.archived_data.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.archived_data.email && user.archived_data.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  // Filter archived loans based on search term
  const filteredLoans = Array.isArray(archivedLoans) ? archivedLoans.filter(loan =>
    (loan.archived_data.loan_amount && loan.archived_data.loan_amount.toString().includes(searchTerm)) ||
    (loan.archived_data.status && loan.archived_data.status.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  return (
    <div className="archived-records">
      <h1 className="title">Archived Records</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <FaSearch className="search-icon" />
      </div>

      {/* Box for Archived Members */}
      <div className="records-box">
        <h2>Archived Members</h2>
        <table className="records-table">
          <thead>
            <tr>
              <th>Mem ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Archived At</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.archived_data.memId}</td>
                  <td>{user.archived_data.first_name}</td>
                  <td>{user.archived_data.last_name}</td>
                  <td>{user.archived_data.email}</td>
                  <td>{new Date(user.archived_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No archived members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Box for Archived Loans */}
      <div className="records-box">
        <h2>Archived Loans</h2>
        <table className="records-table">
          <thead>
            <tr>
              <th>Loan Amount</th>
              <th>Status</th>
              <th>Archived At</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length > 0 ? (
              filteredLoans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.archived_data.loan_amount}</td>
                  <td>{loan.archived_data.status}</td>
                  <td>{new Date(loan.archived_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No archived loans found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchivedRecords;






// export default ArchivedRecords;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Archives = () => {
//   // State to store archive data
//   const [archives, setArchives] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // API call to fetch Archives data
//   const fetchArchives = async () => {
//     try {
//       // Adjust the URL based on your Django backend URL
//       const response = await axios.get('http://localhost:8000/api/archives/');
//       setArchives(response.data);
//     } catch (err) {
//       setError('Failed to load archives');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch archives when component mounts
//   useEffect(() => {
//     fetchArchives();
//   }, []);  // Empty dependency array means it runs once when component mounts

//   // Display loading state or fetched data
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   // Display error if there's an issue
//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div>
//       <h2>Archives</h2>
//       <ul>
//         {archives.map(archive => (
//           <li key={archive.id}>
//             {archive.archive_name} - {archive.created_at}
//             {/* Display any other relevant details */}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Archives;
