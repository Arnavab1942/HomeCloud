import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = new URLSearchParams();
      payload.append('email', email);
      payload.append('password', password);

      await api.post('/api/auth/register', payload);
      navigate('/login');
    } catch (err: any) {
      setError('Registration failed. Email might already be registered.');
    }
  };

  return (
    <div className="page-container">
      <h2 style={{ letterSpacing: "-1.28px", fontWeight: 600, color: "var(--ink)" }}>Register</h2>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="form-container">
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" style={{ background: "var(--ink)", color: "white", borderRadius: "6px", border: "none", padding: "0.75rem", fontWeight: 500 }}>Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default Register;
