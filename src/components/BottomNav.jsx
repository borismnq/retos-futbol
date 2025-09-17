import { useState } from "react";

const BottomNav = ({ activeTab, onTabChange }) => {
  const navItems = [
    {
      id: "matches",
      icon: "⚽",
      label: "Partidos"
    },
    {
      id: "profile",
      icon: "👤",
      label: "Perfil"
    }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
