'use client';

import React, { useState } from 'react';
import { useAuth } from '../../utils/authUtils';
import { logout as logoutApi } from '../../utils/authApi';
import styles from './Sidebar.module.css';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  badge?: string;
  subMenu?: MenuItem[];
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['experience', 'reservation', 'product']);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'brewery', label: '양조장 관리' },
    {
      id: 'experience',
      label: '체험 프로그램',
      subMenu: [
        { id: 'experience-register', label: '체험상품 등록' },
        { id: 'experience-list', label: '체험상품 목록' },
      ]
    },
    {
      id: 'reservation',
      label: '예약 관리',
      subMenu: [
        { id: 'reservation-status', label: '예약 현황' },
        { id: 'reservation-offline', label: '직접 예약 입력'},
      ]
    },
    {
      id: 'product',
      label: '전통주 관리',
      subMenu: [
        { id: 'product-register', label: '제품 등록'},
        { id: 'product-list', label: '제품 관리'},
      ]
    },
    { id: 'statistics', label: '통계' },
    { id: 'settings', label: '설정' }
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleMenuClick = (menuId: string, hasSubMenu: boolean) => {
    if (hasSubMenu) {
      toggleMenu(menuId);
    } else {
      onNavigate(menuId);
    }
  };

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logoutApi();
      logout();
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasSubMenu = (item.subMenu && item.subMenu.length > 0) as boolean;
    const isExpanded = expandedMenus.includes(item.id);
    const isActive = currentPage === item.id;

    return (
      <div key={item.id} className={styles.menuItemContainer}>
        <div
          className={`${styles.menuItem} ${isActive ? styles.active : ''} ${level > 0 ? styles.subMenuItem : ''}`}
          onClick={() => handleMenuClick(item.id, hasSubMenu)}
          style={{ paddingLeft: `${20 + level * 20}px` }}
        >
          <span className={styles.menuLabel}>{item.label}</span>
          
          {item.badge && (
            <span className={styles.badge}>{item.badge}</span>
          )}
          
          {hasSubMenu && (
            <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
              ▼
            </span>
          )}
        </div>

        {hasSubMenu && isExpanded && (
          <div className={styles.subMenu}>
            {item.subMenu!.map(subItem => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>몽향의숲</span>
        <span className={styles.logoSubtext}>관리 시스템</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      <div className={styles.footer}>
        <div 
          className={styles.userInfo}
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className={styles.userAvatar}>
            {user?.nickname?.charAt(0) || '사'}
          </div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{user?.nickname || '사용자'}</div>
            <div className={styles.userEmail}>{user?.email || ''}</div>
          </div>
          <span className={styles.userMenuIcon}>⋮</span>
        </div>

        {showUserMenu && (
          <div className={styles.userMenu}>
            <button 
              className={styles.userMenuItem}
              onClick={() => {
                setShowUserMenu(false);
                onNavigate('settings');
              }}
            >
              <span>설정</span>
            </button>
            <button 
              className={styles.userMenuItem}
              onClick={handleLogout}
            >
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}