import React from 'react';
import styles from './LoadingTransition.module.css';

const LoadingTransition: React.FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <h1 className={styles.loadingText}>
          <span className={styles.kod}>KOD</span>
          <span className={styles.jobs}>JOBS</span>
        </h1>
      </div>
    </div>
  );
};

export default LoadingTransition; 