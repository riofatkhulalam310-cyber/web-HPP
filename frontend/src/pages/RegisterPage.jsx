import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({ nama, email, password });
      if (response.data.success) {
        setSuccess('Registrasi berhasil! Silakan login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">M</div>
          <h1>Martabak Jepang</h1>
          <p>Daftar Akun Baru</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="toast toast-error mb-3" style={{ position: 'relative', top: 0, right: 0, width: '100%' }}>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="toast toast-success mb-3" style={{ position: 'relative', top: 0, right: 0, width: '100%' }}>
              <span>{success}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Budi Santoso"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="admin@martabakjepang.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Daftar Sekarang</span>
              </>
            )}
          </button>
          
          <div className="text-center mt-4">
            <span className="text-muted text-sm">Sudah punya akun? </span>
            <Link to="/login" className="text-primary font-medium text-sm hover:underline">
              Login di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
