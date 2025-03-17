import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignUp.module.css';

interface FormData {
  username: string;
  password: string;
  email: string;
  dob: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
    dob: ''
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          age: calculateAge(formData.dob)
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('User created:', data.user);
        navigate('/authorization');
      } else {
        setError(data.message || 'Failed to sign up');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to connect to server');
    }
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.leftSection}>
        {/* Image will be set as background in CSS */}
      </div>
      <div className={styles.rightSection}>
        <div className={styles.content}>
          <h1>Join <span className={styles.kod}>Kod</span><span className={styles.jobs}>Jobs</span></h1>
          <p>Create your account to get started</p>
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
            />
            <input 
              type="password"
              name="password" 
              placeholder="Password" 
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input 
              type="email"
              name="email" 
              placeholder="Email" 
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className={styles.dateField}>
              <label className={styles.dateLabel}>Date of Birth</label>
              <input 
                type="date"
                name="dob"
                className={styles.dateInput}
                value={formData.dob}
                onChange={handleChange}
                required
                placeholder="Select your date of birth"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <button type="submit" className={styles.signupButton}>
              Sign Up
            </button>
            <p className={styles.loginText}>
              Already have an account? <span onClick={() => navigate('/authorization')} className={styles.loginLink}>Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 