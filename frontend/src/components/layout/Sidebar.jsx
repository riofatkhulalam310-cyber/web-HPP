import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Scale, 
  Coffee, 
  Wallet, 
  Store, 
  Users, 
  Calculator, 
  ShoppingCart,
  Menu,
  ChevronLeft
} from 'lucide-react';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const menuItems = [
    {
      section: 'Utama',
      items: [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard /> },
      ]
    },
    {
      section: 'Master Data',
      items: [
        { path: '/produk', name: 'Produk & Resep', icon: <Coffee /> },
        { path: '/bahan-baku', name: 'Bahan Baku', icon: <Package /> },
        { path: '/satuan', name: 'Satuan', icon: <Scale /> },
      ]
    },
    {
      section: 'Biaya & Pengeluaran',
      items: [
        { path: '/pengeluaran', name: 'Pengeluaran Harian', icon: <Wallet /> },
        { path: '/biaya-tempat', name: 'Biaya Tempat', icon: <Store /> },
        { path: '/karyawan', name: 'Karyawan', icon: <Users /> },
      ]
    },
    {
      section: 'Laporan',
      items: [
        { path: '/hpp', name: 'Kalkulator HPP', icon: <Calculator /> },
      ]
    }
  ];

  const handleMobileClose = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(false)}></div>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">M</div>
          <div className="brand-text">
            <h2>Martabak Jepang</h2>
            <span>Sistem Manajemen HPP</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((section, idx) => (
            <div key={idx} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item, i) => (
                <NavLink 
                  key={i} 
                  to={item.path} 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={handleMobileClose}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-toggle" 
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu size={20} /> : (
              <>
                <ChevronLeft size={20} />
                <span>Sembunyikan</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
