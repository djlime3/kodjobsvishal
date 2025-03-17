import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Authorization.module.css';

interface LoginForm {
  username: string;
  password: string;
}

const Authorization: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authContainer}>
        <div className={styles.leftSection}>
          {/* Image will be set as background in CSS */}
        </div>
        <div className={styles.rightSection}>
          <div className={styles.content}>
            <h1>Welcome to <span className={styles.kod}>Kod</span><span className={styles.jobs}>Jobs</span></h1>
            <p>Sign in to continue</p>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.formGroup}>
              <input 
                type="text"
                name="username"
                placeholder="Username"
                className={styles.input}
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <input 
                type="password"
                name="password"
                placeholder="Password"
                className={styles.input}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button 
                type="submit" 
                className={styles.loginButton}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <p className={styles.signupText}>
                Don't have an account? <span onClick={() => navigate('/signup')} className={styles.signupLink}>Sign Up</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authorization; 