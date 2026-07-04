import React, { useState, useEffect } from 'react';
import { biayaTempatService } from '../services/api';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Edit, Trash2, Plus, Store } from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/format';

const BiayaTempatPage = () => {
  const [biayaList, setBiayaList] = useState([]);
  const [biayaHarian, setBiayaHarian] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, nama_tempat: 'Sewa Tempat Usaha', nominal_bulanan: '', tanggal_berlaku: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await biayaTempatService.getAll();
      if (response.data.success) {
        setBiayaList(response.data.data);
        setBiayaHarian(response.data.biaya_harian);
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
        id: null, nama_tempat: 'Sewa Tempat Usaha', nominal_bulanan: '', tanggal_berlaku: new Date().toISOString().split('T')[0] 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await biayaTempatService.update(formData.id, formData);
      } else {
        await biayaTempatService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data sewa ini?')) {
      try {
        await biayaTempatService.delete(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus');
      }
    }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Biaya Tempat (Sewa)</h1>
          <p>Konversi biaya sewa bulanan ke biaya harian</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Tambah Data Sewa</span>
        </button>
      </div>

      <div className="grid-stats mb-3">
        <Card className="stat-card" glass={true}>
          <div className="stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-dark)' }}>
            <Store />
          </div>
          <div className="stat-info">
            <h4>Beban Sewa Aktif (Harian)</h4>
            <div className="stat-value text-primary">{formatRupiah(biayaHarian)}</div>
            <div className="stat-sub">Otomatis dibagi jumlah hari bulan ini</div>
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
                  <th>Nama Tempat / Keterangan</th>
                  <th>Berlaku Mulai</th>
                  <th className="text-right">Sewa per Bulan</th>
                  <th width="100">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {biayaList.map((item, index) => (
                  <tr key={item.id} className={index === 0 ? "bg-primary-50" : ""}>
                    <td className="font-medium">
                      {item.nama_tempat}
                      {index === 0 && <span className="ml-2 badge badge-success text-xs">Aktif</span>}
                    </td>
                    <td>{formatDate(item.tanggal_berlaku)}</td>
                    <td className="text-right font-bold">{formatRupiah(item.nominal_bulanan)}</td>
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
                {biayaList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">Belum ada data biaya tempat</td>
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
        title={formData.id ? 'Edit Biaya Tempat' : 'Tambah Biaya Tempat'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Simpan</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Tempat</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.nama_tempat}
              onChange={(e) => setFormData({...formData, nama_tempat: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nominal Sewa per Bulan (Rp)</label>
            <input 
              type="number" 
              className="form-input" 
              value={formData.nominal_bulanan}
              onChange={(e) => setFormData({...formData, nominal_bulanan: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Berlaku Mulai Tanggal</label>
            <input 
              type="date" 
              className="form-input" 
              value={formData.tanggal_berlaku}
              onChange={(e) => setFormData({...formData, tanggal_berlaku: e.target.value})}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BiayaTempatPage;
