import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faFileInvoiceDollar, faLandmark, faUsers, faSignOutAlt, faCalendarAlt, faGear, faArchive} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styles from './AdminNavbar.module.css';

const navItems = [
  { icon: faUsers, label: 'Members', key: 'members' },
  { icon: faLandmark, label: 'Accounts', key: 'accounts' },
  { icon: faFileInvoiceDollar, label: 'Loans', key: 'loans' },
  { icon: faDollarSign, label: 'Payments Overview', key: 'payments' },
  { icon: faCalendarAlt, label: 'Payment Schedules', key: 'payment-schedules' },
  { icon: faArchive, label: 'Archive', key: 'archived-records' },
  { icon: faGear, label: 'Settings', key: 'system-settings' },
  { icon: faGear, label: 'Usermgmt', key: 'user-mgmt' },
];

function AdminNavbar({ onLinkClick }) {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?'); // Show confirmation dialog
    if (confirmLogout) {
      
      console.log('Log out confirmed');
      navigate('/'); 
    }
  };

  return (
    <nav className={styles.adminNavbar}>
      <div className={styles.logoContainer}>
        <img
          src="/cong.jpg"
          alt="Logo"
          className={styles.logoImage}
          style={{
            width: '85px',
            height: '85px',
            marginRight: '10px',
            borderRadius: '50%', 
            marginTop: '10px'
          }}
        />
        <h1 className={styles.logoText}>MPSU EMPLOYEES <br /> CREDIT COOP</h1>
      </div>
      <ul className={styles.navList}>
        {navItems.map((item, index) => (
          <li key={index} className={styles.navItem} onClick={() => onLinkClick(item.key)}>
            <FontAwesomeIcon icon={item.icon} className={styles.navIcon} />
            <span className={styles.navLabel}>{item.label}</span>
          </li>
        ))}
      </ul>
      <div className={styles.logOut} onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} className={styles.logOutIcon} />
        <span className={styles.logOutText}>Log out</span>
      </div>
    </nav>
  );
}

export default AdminNavbar;
