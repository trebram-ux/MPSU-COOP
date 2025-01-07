import React, { useState, useEffect } from 'react';
import styles from './DashboardHeader.css';

function DashboardHeader() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // const formatTime = (date) => {
  //   return date.toLocaleTimeString('en-US', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit',
  //   });
  // };

  return (
    <div className="backg">
      <header>
        <div>
          <h2 
            className={styles.welcomeAdmin} 
            style={{ 
              fontSize: '24px', 
              color: 'black', 
              marginLeft: '10px', 
              fontFamily: 'Georgia, serif',
            }}>
            WELCOME ADMIN!
          </h2>
        </div>
        <div 
          className={styles.dateDisplay} 
          style={{ 
            display: 'flex', 
            alignItems: 'right', 
            justifyContent: 'flex-end', 
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            marginLeft: '405px'
          }}>
          <span 
            className={styles.dateText} 
            style={{ 
              fontSize: '19px', 
              color: 'black',
              fontWeight: 'bold',
            }}>
            {formatDate(currentDate)}
          </span>
        </div>
      </header>
    </div>
  );
}

export default DashboardHeader;
