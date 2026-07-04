import React, { useState, useEffect } from 'react';
import { pengeluaranService } from '../services/api';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Edit, Trash2, Plus, Calendar, TrendingDown } from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/format';

const PengeluaranPage = () => {
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    tanggal_dari: new Date(new Date().setDate(1)).toISOString().split('T')[0], // 1st day of current month
    tanggal_sampai: new Date().toISOString().split('T')[0] // today
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, tanggal: new Date().toISOString().split('T')[0], jenis_pengeluaran: '', nominal: '', keterangan: '' 
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await pengeluaranService.getAll(filters);
      if (response.data.success) {
        setPengeluaranList(response.data.data);
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
        tanggal: new Date().toISOString().split('T')[0], 
        jenis_pengeluaran: '', 
        nominal: '', 
        keterangan: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await pengeluaranService.update(formData.id, formData);
      } else {
        await pengeluaranService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data pengeluaran ini?')) {
      try {
        await pengeluaranService.delete(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus');
      }
    }
  };

  const totalPengeluaran = pengeluaranList.reduce((sum, item) => sum + parseFloat(item.nominal), 0);

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Pengeluaran Harian</h1>
          <p>Catat biaya gas, listrik, transportasi, kemasan, dll</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Tambah Pengeluaran</span>
        </button>
      </div>

      <div className="grid-stats mb-3">
        <Card className="stat-card" glass={true}>
          <div className="stat-icon" style={{ background: 'rgba(196, 30, 58, 0.1)', color: 'var(--accent-red)' }}>
            <TrendingDown />
          </div>
          <div className="stat-info">
            <h4>Total Pengeluaran (Periode Ini)</h4>
            <div className="stat-value text-danger">{formatRupiah(totalPengeluaran)}</div>
            <div className="stat-sub">{pengeluaranList.length} transaksi</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="filter-bar px-4 pt-4 mb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-muted" />
              <span className="text-sm font-medium">Dari:</span>
              <input 
                type="date" 
                name="tanggal_dari"
                className="form-input form-sm" 
                value={filters.tanggal_dari}
                onChange={handleFilterChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sampai:</span>
              <input 
                type="date" 
                name="tanggal_sampai"
                className="form-input form-sm" 
                value={filters.tanggal_sampai}
                onChange={handleFilterChange}
              />
            </div>
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
                  <th>Jenis Pengeluaran</th>
                  <th>Keterangan</th>
                  <th className="text-right">Nominal</th>
                  <th width="100">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pengeluaranList.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.tanggal)}</td>
                    <td className="font-medium">{item.jenis_pengeluaran}</td>
                    <td className="text-muted text-sm">{item.keterangan || '-'}</td>
                    <td className="text-right font-bold">{formatRupiah(item.nominal)}</td>
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
                {pengeluaranList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">Tidak ada data pengeluaran pada periode ini</td>
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
        title={formData.id ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Simpan</button>
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
            <label className="form-label">Jenis Pengeluaran</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.jenis_pengeluaran}
              onChange={(e) => setFormData({...formData, jenis_pengeluaran: e.target.value})}
              placeholder="Contoh: Gas LPG, Listrik, Bensin"
              required
              list="jenis_pengeluaran_list"
            />
            <datalist id="jenis_pengeluaran_list">
              <option value="Gas LPG" />
              <option value="Listrik" />
              <option value="Air" />
              <option value="Transportasi" />
              <option value="Kemasan" />
              <option value="Kebersihan" />
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label">Nominal (Rp)</label>
            <input 
              type="number" 
              className="form-input" 
              value={formData.nominal}
              onChange={(e) => setFormData({...formData, nominal: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Keterangan (Opsional)</label>
            <textarea 
              className="form-textarea" 
              value={formData.keterangan || ''}
              onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
              rows="2"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PengeluaranPage;
