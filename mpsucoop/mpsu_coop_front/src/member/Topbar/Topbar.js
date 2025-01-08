import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faUser, faMoneyBill, faCreditCard, faPowerOff } from '@fortawesome/free-solid-svg-icons';

const Topbar = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?'); // Show confirmation dialog
    if (confirmLogout) {
      // Perform any necessary logout logic (e.g., clearing session, tokens)
      console.log('Log out confirmed');
      localStorage.clear(); // Clear local storage or any authentication tokens
      navigate('/'); // Redirect to the login page
    }
  };

  const topbarStyle = {
    height: '50px',
    backgroundColor: '#D5ED9F',
    color: 'green',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '0 30px 30px 0',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const navHeaderStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    margin: 0,
  };

  const navTopbarStyle = {
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  };

  const navItemStyle = {
    margin: '0 15px',
  };

  const navLinkStyle = {
    textDecoration: 'none',
    color: 'black',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: '10px'
  };

  const navIconStyle = {
    fontSize: '20px',
    marginBottom: '5px',
  };

  return (
    <div style={topbarStyle}>
      <div style={logoContainerStyle}>
        <img
          src="/cong.jpg"
          alt="Logo"
          style={{
            width: '60px',
            height: '60px',
            marginRight: '10px',
            borderRadius: '50%', 
          }}
        />
        <div style={navHeaderStyle}>MPSU EMPLOYEES COOP</div>
      </div>
      <ul style={navTopbarStyle}>
        
        <li style={navItemStyle}>
          <Link to="/Home" style={navLinkStyle}>
            <FontAwesomeIcon icon={faTachometerAlt} style={navIconStyle} />
            <p>Home</p>
          </Link>
        </li>
        <li style={navItemStyle}>
          <Link to="/accounts" style={navLinkStyle}>
            <FontAwesomeIcon icon={faUser} style={navIconStyle} />
            <p>Transaction</p>
          </Link>
        </li>
        <li style={navItemStyle}>
          <Link to="/Loans" style={navLinkStyle}>
            <FontAwesomeIcon icon={faMoneyBill} style={navIconStyle} />
            <p>Loan</p>
          </Link>
        </li>
        {/* <li style={navItemStyle}>
          <Link to="/Ledger" style={navLinkStyle}>
            <FontAwesomeIcon icon={faMoneyBill} style={navIconStyle} />
            <p>Ledger</p>
          </Link>
        </li> */}

        {/* <li style={navItemStyle}>
          <Link to="/payment-schedules" style={navLinkStyle}>
            <FontAwesomeIcon icon={faCreditCard} style={navIconStyle} />
            <p>Schedules</p>
          </Link>
        </li>
        <li style={navItemStyle}>
          <Link
            to={`/home/payments/${localStorage.getItem('account_number')}`}
            style={navLinkStyle}
          >
            <FontAwesomeIcon icon={faCreditCard} style={navIconStyle} />
            <p>Payment</p>
          </Link>
        </li> */}

        <li style={navItemStyle}>
          <button
            onClick={handleLogout}
            style={{ ...navLinkStyle, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={faPowerOff} style={navIconStyle} />
            <p>Logout</p>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Topbar;
