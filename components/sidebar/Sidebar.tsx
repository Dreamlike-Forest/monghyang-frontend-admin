'use client';

import React, { useState, useEffect } from 'react';
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

interface UserData {
  user: {
    id: string;
    user_id: string;
    email: string;
    name: string;
    phone: string;
    isBreweryRegistered: boolean;
    createdAt: string;
  };
  brewery: any;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['experience', 'reservation', 'product']);
  const [userName, setUserName] = useState('관리자');

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          const data: UserData = JSON.parse(storedData);
          if (data.user && data.user.name) {
            setUserName(data.user.name);
            return;
          }
        }

        // 2. 테스트용 기본 데이터 설정
        const defaultUserData: UserData = {
          user: {
            id: "1",
            user_id: "user_001",
            email: "brewery@company.com",
            name: "홍길동",
            phone: "02-1234-5678",
            isBreweryRegistered: false,
            createdAt: new Date().toISOString()
          },
          brewery: null
        };
        
        localStorage.setItem('userData', JSON.stringify(defaultUserData));
        setUserName(defaultUserData.user.name);

      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        setUserName('관리자');
      }
    };

    loadUserData();
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: '대시보드'
    },
    {
      id: 'brewery',
      label: '양조장 관리'
    },
    {
      id: 'experience',
      label: '체험 프로그램',
      subMenu: [
        { id: 'experience-register', label: '체험상품 등록' },
        { id: 'experience-list', label: '체험상품 목록' },
        { id: 'experience-schedule', label: '일정 관리' }
      ]
    },
    {
      id: 'reservation',
      label: '예약 관리',
      subMenu: [
        { id: 'reservation-status', label: '예약 현황' },
        { id: 'reservation-phone', label: '전화예약 입력'},
        { id: 'reservation-block', label: '예약 차단 설정', badge: '준비중' }
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
    {
      id: 'statistics',
      label: '통계'
    },
    {
      id: 'settings',
      label: '설정'
    }
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
        <span className={styles.logoText}>양조장 관리 시스템</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>👤</div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{userName}</div>
            <div className={styles.userRole}>관리자</div>
          </div>
        </div>
      </div>
    </aside>
  );
}