import React, { useState, useEffect } from 'react';
import { bahanBakuService, satuanService } from '../services/api';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { formatRupiah, formatNumber } from '../utils/format';

const BahanBakuPage = () => {
  const [bahanList, setBahanList] = useState([]);
  const [satuanList, setSatuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, nama_bahan: '', harga_beli: '', jumlah_beli: 1, satuan_id: '' 
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bahanRes, satuanRes] = await Promise.all([
        bahanBakuService.getAll(),
        satuanService.getAll()
      ]);
      
      if (bahanRes.data.success) setBahanList(bahanRes.data.data);
      if (satuanRes.data.success) setSatuanList(satuanRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ 
        id: null, nama_bahan: '', harga_beli: '', jumlah_beli: 1, 
        satuan_id: satuanList.length > 0 ? satuanList[0].id : '' 
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (formData.id) {
        await bahanBakuService.update(formData.id, formData);
      } else {
        await bahanBakuService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus bahan baku ini?')) {
      try {
        await bahanBakuService.delete(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus bahan baku');
      }
    }
  };

  const filteredData = bahanList.filter(item => 
    item.nama_bahan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Bahan Baku</h1>
          <p>Kelola data bahan baku dan harga beli</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Tambah Bahan</span>
        </button>
      </div>

      <Card>
        <div className="filter-bar px-4 pt-4 mb-0">
          <div className="search-input w-full" style={{ maxWidth: '400px' }}>
            <Search />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Cari bahan baku..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container m-4 mt-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Bahan</th>
                <th className="text-right">Harga Beli</th>
                <th className="text-right">Kuantitas</th>
                <th className="text-right">Harga per Unit Dasar</th>
                <th width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => {
                const totalBaseUnits = item.jumlah_beli * item.nilai_konversi_ke_dasar;
                const pricePerBaseUnit = item.harga_beli / totalBaseUnits;
                let baseUnitName = '';
                if (item.kategori === 'berat') baseUnitName = 'gram';
                else if (item.kategori === 'volume') baseUnitName = 'ml';
                else baseUnitName = 'pcs';

                return (
                  <tr key={item.id}>
                    <td className="font-medium">{item.nama_bahan}</td>
                    <td className="text-right font-bold text-primary">{formatRupiah(item.harga_beli)}</td>
                    <td className="text-right">
                      {formatNumber(item.jumlah_beli)} {item.nama_satuan}
                    </td>
                    <td className="text-right text-muted text-sm">
                      {formatRupiah(pricePerBaseUnit)} / {baseUnitName}
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
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">Tidak ada data bahan baku</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={formData.id ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Simpan</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error mb-3">{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Nama Bahan Baku</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.nama_bahan}
              onChange={(e) => setFormData({...formData, nama_bahan: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Harga Beli (Rp)</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.harga_beli}
                onChange={(e) => setFormData({...formData, harga_beli: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Jumlah</label>
              <input 
                type="number" 
                step="any"
                className="form-input" 
                value={formData.jumlah_beli}
                onChange={(e) => setFormData({...formData, jumlah_beli: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Satuan</label>
              <select 
                className="form-select"
                value={formData.satuan_id}
                onChange={(e) => setFormData({...formData, satuan_id: e.target.value})}
                required
              >
                <option value="">-- Pilih Satuan --</option>
                {satuanList.map(s => (
                  <option key={s.id} value={s.id}>{s.nama_satuan}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BahanBakuPage;
