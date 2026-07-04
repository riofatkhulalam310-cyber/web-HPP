import React, { useState, useEffect } from 'react';
import { karyawanService } from '../services/api';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { Edit, Trash2, Plus, Users } from 'lucide-react';
import { formatRupiah } from '../utils/format';

const KaryawanPage = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [totalBiayaHarian, setTotalBiayaHarian] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, nama: '', gaji: '', periode_gaji: 'bulanan'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await karyawanService.getAll();
      if (response.data.success) {
        setKaryawanList(response.data.data);
        setTotalBiayaHarian(response.data.total_biaya_harian);
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
      setFormData({ 
        id: null, nama: '', gaji: '', periode_gaji: 'bulanan'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await karyawanService.update(formData.id, formData);
      } else {
        await karyawanService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data karyawan ini?')) {
      try {
        await karyawanService.delete(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus');
      }
    }
  };

  const getPeriodeBadge = (periode) => {
    switch (periode) {
      case 'harian': return <Badge variant="warning">Harian</Badge>;
      case 'mingguan': return <Badge variant="primary">Mingguan</Badge>;
      case 'bulanan': return <Badge variant="success">Bulanan</Badge>;
      default: return <Badge>{periode}</Badge>;
    }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Gaji Karyawan</h1>
          <p>Konversi gaji ke beban biaya harian</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      <div className="grid-stats mb-3">
        <Card className="stat-card" glass={true}>
          <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#B8960A' }}>
            <Users />
          </div>
          <div className="stat-info">
            <h4>Beban Gaji Total (Harian)</h4>
            <div className="stat-value text-primary">{formatRupiah(totalBiayaHarian)}</div>
            <div className="stat-sub">Dari {karyawanList.length} karyawan</div>
          </div>
        </Card>
      </div>

      <Card>
        {loading ? (
           <div className="p-5 text-center"><div className="spinner mx-auto"></div></div>
        ) : (
          <div className="table-container m-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Karyawan</th>
                  <th>Periode Gaji</th>
                  <th className="text-right">Nominal Gaji</th>
                  <th className="text-right">Biaya Harian</th>
                  <th width="100">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {karyawanList.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.nama}</td>
                    <td>{getPeriodeBadge(item.periode_gaji)}</td>
                    <td className="text-right">{formatRupiah(item.gaji)}</td>
                    <td className="text-right font-bold text-primary">{formatRupiah(item.gaji_harian)}</td>
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
                {karyawanList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">Belum ada data karyawan</td>
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
        title={formData.id ? 'Edit Data Karyawan' : 'Tambah Karyawan'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Simpan</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Karyawan</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nominal Gaji (Rp)</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.gaji}
                onChange={(e) => setFormData({...formData, gaji: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Periode Gaji</label>
              <select 
                className="form-select"
                value={formData.periode_gaji}
                onChange={(e) => setFormData({...formData, periode_gaji: e.target.value})}
              >
                <option value="bulanan">Bulanan (dibagi 30)</option>
                <option value="mingguan">Mingguan (dibagi 7)</option>
                <option value="harian">Harian (dibagi 1)</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KaryawanPage;
