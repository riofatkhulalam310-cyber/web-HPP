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
        <Card className="stat-card" glass={true}>
          <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#B8960A' }}>
            <ShoppingCart />
          </div>
          <div className="stat-info">
            <h4>Penjualan (Hari Ini)</h4>
            <div className="stat-value">{formatRupiah(data?.harian?.penjualan)}</div>
            <div className="stat-sub">{formatNumber(data?.harian?.unit_terjual)} unit terjual</div>
          </div>
        </Card>

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

        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(45, 139, 78, 0.1)', color: 'var(--accent-green)' }}>
            <TrendingUp />
          </div>
          <div className="stat-info">
            <h4>Profit Kotor (Estimasi)</h4>
            <div className="stat-value">
              {formatRupiah((data?.harian?.penjualan || 0) - (data?.harian?.total_biaya || 0))}
            </div>
            <div className="stat-sub">Penjualan - Total Biaya</div>
          </div>
        </Card>
      </div>

      <div className="grid-2 mb-3">
        <Card title="Trend Penjualan & Pengeluaran (30 Hari)">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend_penjualan || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="tgl" tickFormatter={(tick) => new Date(tick).getDate()} stroke="var(--text-tertiary)" />
                <YAxis tickFormatter={(tick) => `Rp${tick/1000}k`} stroke="var(--text-tertiary)" />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Area type="monotone" dataKey="total" name="Penjualan" stroke="#4CAF50" fillOpacity={1} fill="url(#colorPenjualan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

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
