import React, { useState, useEffect } from 'react';
import { hppService, produkService } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatRupiah, formatDate } from '../utils/format';
import { Calculator, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const HppPage = () => {
  const [produkList, setProdukList] = useState([]);
  const [selectedProdukId, setSelectedProdukId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jumlahProduksi, setJumlahProduksi] = useState('');
  
  const [hppResult, setHppResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    try {
      const response = await produkService.getAll();
      if (response.data.success) {
        setProdukList(response.data.data);
        if (response.data.data.length > 0) {
          const firstProduct = response.data.data[0];
          setSelectedProdukId(firstProduct.id);
          setJumlahProduksi(firstProduct.jumlah_produksi_default || 1);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProdukChange = (e) => {
    const pId = e.target.value;
    setSelectedProdukId(pId);
    
    // Auto-update default quantity
    const prod = produkList.find(p => p.id == pId);
    if (prod) {
      setJumlahProduksi(prod.jumlah_produksi_default || 1);
    }
  };

  const hitungHPP = async () => {
    if (!selectedProdukId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await hppService.hitung({
        produk_id: selectedProdukId,
        jumlah_produksi: jumlahProduksi,
        tanggal: tanggal
      });
      
      if (response.data.success) {
        setHppResult(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghitung HPP');
      setHppResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Kalkulator HPP</h1>
          <p>Hitung Harga Pokok Produksi secara presisi</p>
        </div>
      </div>

      <div className="grid-2 mb-3">
        {/* FORM KALKULATOR */}
        <Card title="Parameter Perhitungan">
          <div className="form-group">
            <label className="form-label">Produk / Menu</label>
            <select 
              className="form-select"
              value={selectedProdukId}
              onChange={handleProdukChange}
            >
              <option value="">-- Pilih Produk --</option>
              {produkList.map(p => (
                <option key={p.id} value={p.id}>{p.nama_produk}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Calendar size={16} /> Tanggal Asumsi Biaya Harian
            </label>
            <input 
              type="date" 
              className="form-input" 
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
            <div className="text-xs text-muted mt-1">
              Menggunakan data gaji dan pengeluaran lain pada tanggal ini
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Jumlah Produksi / Porsi</label>
            <input 
              type="number" 
              className="form-input" 
              value={jumlahProduksi}
              onChange={(e) => setJumlahProduksi(e.target.value)}
              min="1"
            />
          </div>

          <button 
            className="btn btn-primary w-full mt-3" 
            onClick={hitungHPP}
            disabled={loading || !selectedProdukId}
          >
            {loading ? <div className="spinner"></div> : <><Calculator size={20} /> Hitung HPP</>}
          </button>

          {error && <div className="form-error mt-3 p-3 bg-red-50 rounded text-danger text-center">{error}</div>}
        </Card>

        {/* HASIL RINGKASAN */}
        {hppResult ? (
          <Card className="bg-gradient-to-br from-primary-50 to-white" border="primary">
            <div className="text-center p-4">
              <div className="text-sm font-medium text-muted uppercase tracking-wider mb-2">
                HPP Per Unit / Porsi
              </div>
              <div className="text-4xl font-bold font-poppins text-primary mb-2">
                {formatRupiah(hppResult.hpp_per_unit)}
              </div>
              <Badge variant="primary">{hppResult.produk.nama}</Badge>
            </div>
            
            <div className="border-t border-light mt-4 pt-4 px-4 pb-4">
              <h4 className="font-medium text-sm text-muted mb-3">Ringkasan Total Biaya (untuk {hppResult.jumlah_produksi} porsi)</h4>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Bahan Baku (Resep)</span>
                <span className="font-bold">{formatRupiah(hppResult.breakdown.biaya_bahan_baku)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Karyawan (Harian)</span>
                <span className="font-bold">{formatRupiah(hppResult.breakdown.biaya_karyawan)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Sewa Tempat (Harian)</span>
                <span className="font-bold">{formatRupiah(hppResult.breakdown.biaya_tempat)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">Pengeluaran Lainnya</span>
                <span className="font-bold">{formatRupiah(hppResult.breakdown.biaya_lainnya)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-light border-dashed">
                <span className="font-bold text-primary">Total Biaya Produksi</span>
                <span className="font-bold text-primary text-lg">{formatRupiah(hppResult.breakdown.total_biaya)}</span>
              </div>
            </div>
          </Card>
        ) : (
          <div className="card flex items-center justify-center flex-col p-5 text-muted h-full opacity-50">
            <Calculator size={48} className="mb-3" />
            <p>Pilih parameter dan klik Hitung untuk melihat hasil HPP.</p>
          </div>
        )}
      </div>

      {hppResult && (
        <div className="grid-2">
          {/* CHART PROPORSI */}
          <Card title="Proporsi Biaya">
            <div className="chart-container flex items-center justify-center" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hppResult.proporsi.filter(p => p.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {hppResult.proporsi.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* DETAIL BAHAN BAKU */}
          <Card title="Detail Bahan Baku (Resep)">
            <div className="table-container m-0" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bahan</th>
                    <th className="text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {hppResult.detail_bahan.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <div className="font-medium">{item.nama_bahan}</div>
                        <div className="text-xs text-muted">{item.jumlah_pakai} {item.satuan_pakai}</div>
                      </td>
                      <td className="text-right font-medium">
                        {item.error ? (
                          <Badge variant="danger" title={item.error}>Error</Badge>
                        ) : (
                          formatRupiah(item.biaya)
                        )}
                      </td>
                    </tr>
                  ))}
                  {hppResult.detail_bahan.length === 0 && (
                    <tr>
                      <td colSpan="2" className="text-center text-muted py-3">Tidak ada resep bahan baku</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HppPage;
