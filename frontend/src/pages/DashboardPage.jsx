import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatRupiah, formatNumber } from '../utils/format';
import { 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Store, 
  Users, 
  ShoppingCart,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDashboard();
  }, [tanggal]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getSummary(tanggal);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <span>Memuat data dashboard...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan performa bisnis dan HPP</p>
        </div>
        <div className="flex gap-2 items-center">
          <Calendar size={20} className="text-muted" />
          <input 
            type="date" 
            className="form-input" 
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>
      </div>

      <div className="grid-stats mb-3">
        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-dark)' }}>
            <Wallet />
          </div>
          <div className="stat-info">
            <h4>Total Biaya (Hari Ini)</h4>
            <div className="stat-value">{formatRupiah(data?.harian?.total_biaya)}</div>
            <div className="stat-sub">
              Bahan + Karyawan + Tempat + Lain
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(196, 30, 58, 0.1)', color: 'var(--accent-red)' }}>
            <TrendingDown />
          </div>
          <div className="stat-info">
            <h4>Pengeluaran Lain (Hari Ini)</h4>
            <div className="stat-value">{formatRupiah(data?.harian?.pengeluaran)}</div>
            <div className="stat-sub">Di luar bahan baku</div>
          </div>
        </Card>
      </div>

      <div className="grid-2 mb-3">
        <Card title="HPP per Produk (Hari Ini)">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th className="text-right">Biaya Bahan</th>
                  <th className="text-right">HPP / Unit</th>
                </tr>
              </thead>
              <tbody>
                {data?.hpp_produk?.slice(0, 5).map((hpp) => (
                  <tr key={hpp.id}>
                    <td>{hpp.nama_produk}</td>
                    <td className="text-right">{formatRupiah(hpp.biaya_bahan)}</td>
                    <td className="text-right font-bold text-primary">{formatRupiah(hpp.hpp_per_unit)}</td>
                  </tr>
                ))}
                {(!data?.hpp_produk || data.hpp_produk.length === 0) && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">Belum ada data produk/resep</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
