import React, { useState, useEffect } from 'react';
import { produkService, bahanBakuService, satuanService } from '../services/api';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Edit, Trash2, Plus, ChevronDown, ChevronUp, Package, Scale } from 'lucide-react';
import { formatNumber, formatRupiah } from '../utils/format';
import Badge from '../components/ui/Badge';

const ProdukPage = () => {
  const [produkList, setProdukList] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [satuanList, setSatuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, nama_produk: '', deskripsi: '', jumlah_produksi_default: 1 
  });
  
  const [isResepModalOpen, setIsResepModalOpen] = useState(false);
  const [resepFormData, setResepFormData] = useState({
    id: null, produk_id: null, bahan_baku_id: '', jumlah_pakai: '', satuan_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [produkRes, bahanRes, satuanRes] = await Promise.all([
        produkService.getAll(),
        bahanBakuService.getAll(),
        satuanService.getAll()
      ]);
      
      if (produkRes.data.success) {
        // Fetch recipes for each product to show in the expanded view
        const produkWithResep = await Promise.all(
          produkRes.data.data.map(async (p) => {
            const res = await produkService.getById(p.id);
            return res.data.success ? res.data.data : p;
          })
        );
        setProdukList(produkWithResep);
      }
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
      setFormData({
        id: item.id,
        nama_produk: item.nama_produk,
        deskripsi: item.deskripsi,
        jumlah_produksi_default: item.jumlah_produksi_default
      });
    } else {
      setFormData({ id: null, nama_produk: '', deskripsi: '', jumlah_produksi_default: 1 });
    }
    setIsModalOpen(true);
  };

  const handleProdukSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await produkService.update(formData.id, formData);
      } else {
        await produkService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDeleteProduk = async (id) => {
    if (window.confirm('Yakin ingin menghapus produk ini? Semua data resep dan riwayat transaksi juga akan terpengaruh.')) {
      try {
        await produkService.delete(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus produk');
      }
    }
  };

  // RESEP FUNCTIONS
  const openResepModal = (produkId, item = null) => {
    if (item) {
      setResepFormData(item);
    } else {
      setResepFormData({
        id: null, produk_id: produkId, bahan_baku_id: '', jumlah_pakai: '', satuan_id: ''
      });
    }
    setIsResepModalOpen(true);
  };

  const handleResepSubmit = async (e) => {
    e.preventDefault();
    try {
      if (resepFormData.id) {
        await produkService.updateResep(resepFormData.produk_id, resepFormData.id, resepFormData);
      } else {
        await produkService.addResep(resepFormData.produk_id, resepFormData);
      }
      setIsResepModalOpen(false);
      fetchData(); // Refresh all to get updated costs
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDeleteResep = async (produkId, resepId) => {
    if (window.confirm('Hapus bahan ini dari resep?')) {
      try {
        await produkService.deleteResep(produkId, resepId);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Produk & Resep</h1>
          <p>Kelola menu produk dan komposisi bahan baku</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Tambah Produk</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {produkList.map((produk) => (
          <Card key={produk.id} className="mb-2">
            {/* Header / Summary */}
            <div 
              className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-50"
              onClick={() => toggleExpand(produk.id)}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="stat-icon" 
                  style={{ width: '40px', height: '40px', background: 'var(--primary-100)', color: 'var(--primary-dark)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg m-0">{produk.nama_produk}</h3>
                  <div className="text-sm text-muted mt-1">
                    Produksi default: {produk.jumlah_produksi_default} porsi
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted">Total Biaya Bahan</div>
                  <div className="font-bold text-primary">{formatRupiah(produk.total_biaya_bahan)}</div>
                </div>
                <button className="btn-icon">
                  {expandedId === produk.id ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>
            </div>

            {/* Expanded Details - Resep */}
            {expandedId === produk.id && (
              <div className="border-t border-light p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Scale size={18} className="text-primary" />
                    Komposisi / Resep
                  </h4>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-ghost" onClick={() => openModal(produk)}>
                      <Edit size={16} /> Edit Produk
                    </button>
                    <button className="btn btn-sm btn-ghost text-danger" onClick={() => handleDeleteProduk(produk.id)}>
                      <Trash2 size={16} /> Hapus Produk
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={() => openResepModal(produk.id)}>
                      <Plus size={16} /> Tambah Bahan
                    </button>
                  </div>
                </div>

                <div className="table-container bg-white">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Bahan Baku</th>
                        <th className="text-right">Jumlah Pakai</th>
                        <th className="text-right">Estimasi Biaya</th>
                        <th width="80">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produk.resep?.map((r) => (
                        <tr key={r.id}>
                          <td>{r.nama_bahan}</td>
                          <td className="text-right">
                            {formatNumber(r.jumlah_pakai)} {r.satuan_pakai}
                          </td>
                          <td className="text-right">
                            {r.error ? (
                              <Badge variant="danger" title={r.error}>Error Satuan</Badge>
                            ) : (
                              <span className="font-medium text-primary">{formatRupiah(r.biaya)}</span>
                            )}
                          </td>
                          <td>
                            <div className="actions">
                              <button className="btn-icon text-danger" onClick={() => handleDeleteResep(produk.id, r.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!produk.resep || produk.resep.length === 0) && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-4">Belum ada bahan baku di resep ini</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        ))}

        {produkList.length === 0 && (
          <div className="empty-state card">
            <Package />
            <h3>Belum Ada Produk</h3>
            <p>Mulai tambahkan produk menu martabak Anda beserta resepnya.</p>
            <button className="btn btn-primary mt-3" onClick={() => openModal()}>
              Tambah Produk Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal Produk */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={formData.id ? 'Edit Produk' : 'Tambah Produk'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleProdukSubmit}>Simpan</button>
          </>
        }
      >
        <form onSubmit={handleProdukSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Produk / Menu</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.nama_produk}
              onChange={(e) => setFormData({...formData, nama_produk: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea 
              className="form-textarea" 
              value={formData.deskripsi || ''}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Jumlah Produksi (Porsi) dari Resep Ini</label>
            <input 
              type="number" 
              className="form-input" 
              value={formData.jumlah_produksi_default}
              onChange={(e) => setFormData({...formData, jumlah_produksi_default: e.target.value})}
              min="1"
              required
            />
            <div className="text-xs text-muted mt-1">
              Contoh: Jika resep di bawah ini adalah adonan untuk 10 loyang martabak, isi dengan 10.
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Resep */}
      <Modal 
        isOpen={isResepModalOpen} 
        onClose={() => setIsResepModalOpen(false)}
        title="Tambah Bahan Baku ke Resep"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIsResepModalOpen(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleResepSubmit}>Simpan Bahan</button>
          </>
        }
      >
        <form onSubmit={handleResepSubmit}>
          <div className="form-group">
            <label className="form-label">Bahan Baku</label>
            <select 
              className="form-select"
              value={resepFormData.bahan_baku_id}
              onChange={(e) => setResepFormData({...resepFormData, bahan_baku_id: e.target.value})}
              required
            >
              <option value="">-- Pilih Bahan Baku --</option>
              {bahanList.map(b => (
                <option key={b.id} value={b.id}>{b.nama_bahan}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Jumlah Pemakaian</label>
              <input 
                type="number" 
                step="any"
                className="form-input" 
                value={resepFormData.jumlah_pakai}
                onChange={(e) => setResepFormData({...resepFormData, jumlah_pakai: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Satuan</label>
              <select 
                className="form-select"
                value={resepFormData.satuan_id}
                onChange={(e) => setResepFormData({...resepFormData, satuan_id: e.target.value})}
                required
              >
                <option value="">-- Pilih Satuan --</option>
                {satuanList.map(s => (
                  <option key={s.id} value={s.id}>{s.nama_satuan} ({s.kategori})</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded text-sm text-warning mt-2 border border-warning" style={{ background: 'rgba(212, 175, 55, 0.1)', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
            <strong>Penting:</strong> Pastikan kategori satuan pemakaian SAMA dengan kategori satuan saat pembelian (Contoh: Beli dalam Kg (Berat), pakai dalam Gram (Berat)).
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProdukPage;
