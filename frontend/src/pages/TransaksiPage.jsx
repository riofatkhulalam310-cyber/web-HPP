import React, { useState, useEffect } from 'react';
import { transaksiService, produkService } from '../services/api';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Edit, Trash2, Plus, Calendar, Search } from 'lucide-react';
import { formatRupiah, formatDate, formatNumber } from '../utils/format';

const TransaksiPage = () => {
  const [transaksiList, setTransaksiList] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    tanggal_dari: new Date(new Date().setDate(1)).toISOString().split('T')[0], // 1st day of current month
    tanggal_sampai: new Date().toISOString().split('T')[0], // today
    produk_id: ''
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, produk_id: '', jumlah_terjual: 1, harga_jual: '', tanggal: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    // Fetch produk for dropdowns
    const fetchProduk = async () => {
      try {
        const res = await produkService.getAll();
        if (res.data.success) {
          setProdukList(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduk();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await transaksiService.getAll(filters);
      if (response.data.success) {
        setTransaksiList(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ 
        id: null, 
        produk_id: produkList.length > 0 ? produkList[0].id : '', 
        jumlah_terjual: 1, 
        harga_jual: '', 
        tanggal: new Date().toISOString().split('T')[0] 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await transaksiService.update(formData.id, formData);
      } else {
        await transaksiService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      try {
        await transaksiService.delete(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus');
      }
    }
  };

  const totalPenjualan = transaksiList.reduce((sum, item) => sum + (item.jumlah_terjual * item.harga_jual), 0);
  const totalItem = transaksiList.reduce((sum, item) => sum + parseInt(item.jumlah_terjual), 0);

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Riwayat Penjualan</h1>
          <p>Catat transaksi penjualan harian</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Tambah Penjualan</span>
        </button>
      </div>

      <Card>
        <div className="filter-bar px-4 pt-4 mb-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-muted" />
              <input 
                type="date" 
                name="tanggal_dari"
                className="form-input form-sm" 
                value={filters.tanggal_dari}
                onChange={handleFilterChange}
              />
            </div>
            <span className="text-muted text-sm">s/d</span>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                name="tanggal_sampai"
                className="form-input form-sm" 
                value={filters.tanggal_sampai}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Search size={18} className="text-muted" />
            <select 
              name="produk_id" 
              className="form-select form-sm"
              value={filters.produk_id}
              onChange={handleFilterChange}
            >
              <option value="">Semua Produk</option>
              {produkList.map(p => (
                <option key={p.id} value={p.id}>{p.nama_produk}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
           <div className="p-5 text-center"><div className="spinner mx-auto"></div></div>
        ) : (
          <div className="table-container m-4 mt-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Produk</th>
                  <th className="text-right">Harga Jual</th>
                  <th className="text-right">Jumlah (Unit)</th>
                  <th className="text-right">Total Transaksi</th>
                  <th width="80">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transaksiList.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.tanggal)}</td>
                    <td className="font-medium">{item.nama_produk}</td>
                    <td className="text-right text-muted">{formatRupiah(item.harga_jual)}</td>
                    <td className="text-right">{formatNumber(item.jumlah_terjual)}</td>
                    <td className="text-right font-bold text-success">
                      {formatRupiah(item.jumlah_terjual * item.harga_jual)}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn-icon text-primary" onClick={() => openModal(item)} title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(item.id)} title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transaksiList.length > 0 && (
                  <tr className="bg-gray-50 border-t-2">
                    <td colSpan="3" className="text-right font-bold">TOTAL PERIODE INI</td>
                    <td className="text-right font-bold">{formatNumber(totalItem)}</td>
                    <td className="text-right font-bold text-primary">{formatRupiah(totalPenjualan)}</td>
                    <td></td>
                  </tr>
                )}
                {transaksiList.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">Tidak ada data transaksi pada periode ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={formData.id ? 'Edit Transaksi' : 'Catat Penjualan'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Simpan Transaksi</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input 
              type="date" 
              className="form-input" 
              value={formData.tanggal}
              onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Produk Terjual</label>
            <select 
              className="form-select"
              value={formData.produk_id}
              onChange={(e) => setFormData({...formData, produk_id: e.target.value})}
              required
            >
              <option value="">-- Pilih Produk --</option>
              {produkList.map(p => (
                <option key={p.id} value={p.id}>{p.nama_produk}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Harga Jual (Rp/Unit)</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.harga_jual}
                onChange={(e) => setFormData({...formData, harga_jual: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Jumlah Unit Terjual</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.jumlah_terjual}
                onChange={(e) => setFormData({...formData, jumlah_terjual: e.target.value})}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded text-center">
            <div className="text-sm text-muted">Total Nilai Transaksi</div>
            <div className="font-bold text-xl text-primary mt-1">
              {formatRupiah((formData.harga_jual || 0) * (formData.jumlah_terjual || 0))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransaksiPage;
