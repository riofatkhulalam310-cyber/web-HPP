import React, { useState, useEffect } from 'react';
import { satuanService } from '../services/api';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { formatNumber } from '../utils/format';

const SatuanPage = () => {
  const [satuanList, setSatuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama_satuan: '', kategori: 'berat', nilai_konversi_ke_dasar: 1 });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSatuan();
  }, []);

  const fetchSatuan = async () => {
    try {
      const response = await satuanService.getAll();
      if (response.data.success) {
        setSatuanList(response.data.data);
      }
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
      setFormData({ id: null, nama_satuan: '', kategori: 'berat', nilai_konversi_ke_dasar: 1 });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (formData.id) {
        await satuanService.update(formData.id, formData);
      } else {
        await satuanService.create(formData);
      }
      setIsModalOpen(false);
      fetchSatuan();
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus satuan ini?')) {
      try {
        await satuanService.delete(id);
        fetchSatuan();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus satuan');
      }
    }
  };

  const getKategoriBadge = (kategori) => {
    switch (kategori) {
      case 'berat': return <Badge variant="primary">Berat</Badge>;
      case 'volume': return <Badge variant="success">Volume</Badge>;
      case 'satuan': return <Badge variant="warning">Satuan/Pcs</Badge>;
      default: return <Badge>{kategori}</Badge>;
    }
  };

  const getBaseUnit = (kategori) => {
    switch (kategori) {
      case 'berat': return 'gram';
      case 'volume': return 'ml';
      case 'satuan': return 'pcs';
      default: return '';
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Manajemen Satuan</h1>
          <p>Kelola satuan bahan baku dan nilai konversinya</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Tambah Satuan</span>
        </button>
      </div>

      <Card>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Satuan</th>
                <th>Kategori</th>
                <th>Konversi ke Dasar</th>
                <th width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {satuanList.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.nama_satuan}</td>
                  <td>{getKategoriBadge(item.kategori)}</td>
                  <td>
                    1 {item.nama_satuan} = {formatNumber(item.nilai_konversi_ke_dasar, 2)} {getBaseUnit(item.kategori)}
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
              {satuanList.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">Belum ada data satuan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={formData.id ? 'Edit Satuan' : 'Tambah Satuan'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Simpan</button>
          </>
        }
      >
        <form id="satuanForm" onSubmit={handleSubmit}>
          {error && <div className="form-error mb-3">{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Nama Satuan</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.nama_satuan}
              onChange={(e) => setFormData({...formData, nama_satuan: e.target.value})}
              required
              placeholder="Contoh: Kilogram"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select 
              className="form-select"
              value={formData.kategori}
              onChange={(e) => setFormData({...formData, kategori: e.target.value})}
            >
              <option value="berat">Berat (Dasar: gram)</option>
              <option value="volume">Volume (Dasar: ml)</option>
              <option value="satuan">Satuan/Pcs (Dasar: pcs)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Nilai Konversi ke Satuan Dasar ({getBaseUnit(formData.kategori)})
            </label>
            <input 
              type="number" 
              step="any"
              className="form-input" 
              value={formData.nilai_konversi_ke_dasar}
              onChange={(e) => setFormData({...formData, nilai_konversi_ke_dasar: e.target.value})}
              required
            />
            <div className="text-xs text-muted mt-1">
              Berapa {getBaseUnit(formData.kategori)} dalam 1 {formData.nama_satuan || 'satuan ini'}?
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SatuanPage;
