import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Welcome.module.css';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleNextClick = () => {
    navigate('/authorization');
  };

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.content}>
        <h1>Welcome to <span className={styles.kod}>Kod</span><span className={styles.jobs}>Jobs</span>!</h1>
        <p>We're glad to have you here. Start exploring our platform to find your next opportunity.</p>
        <button className={styles.nextButton} onClick={handleNextClick}>
          Next <span className={styles.arrow}>→</span>
        </button>
      </div>
    </div>
  );
};

export default Welcome; 