import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Registration.module.css';
import LoadingTransition from './LoadingTransition';

interface LoginData {
  username: string;
  password: string;
}

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoading(true);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show loading for 2 seconds before redirecting
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error during login. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingTransition />;
  }

  return (
    <div className={styles.registrationContainer}>
      <div className={styles.leftSection}></div>
      <div className={styles.rightSection}>
        <div className={styles.content}>
          <h1>
            <span className={styles.kod}>KOD</span>
            <span className={styles.jobs}>JOBS</span>
          </h1>
          <p>Login to your account</p>
          <form className={styles.formGroup} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
          <p className={styles.signupText}>
            Don't have an account?{' '}
            <span className={styles.signupLink} onClick={() => navigate('/signup')}>
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration; 