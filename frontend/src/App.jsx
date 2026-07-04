import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransaksiPage from './pages/TransaksiPage';
import ProdukPage from './pages/ProdukPage';
import BahanBakuPage from './pages/BahanBakuPage';
import SatuanPage from './pages/SatuanPage';
import PengeluaranPage from './pages/PengeluaranPage';
import BiayaTempatPage from './pages/BiayaTempatPage';
import KaryawanPage from './pages/KaryawanPage';
import HppPage from './pages/HppPage';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes Wrapper */}
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="transaksi" element={<TransaksiPage />} />
              <Route path="produk" element={<ProdukPage />} />
              <Route path="bahan-baku" element={<BahanBakuPage />} />
              <Route path="satuan" element={<SatuanPage />} />
              <Route path="pengeluaran" element={<PengeluaranPage />} />
              <Route path="biaya-tempat" element={<BiayaTempatPage />} />
              <Route path="karyawan" element={<KaryawanPage />} />
              <Route path="hpp" element={<HppPage />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
