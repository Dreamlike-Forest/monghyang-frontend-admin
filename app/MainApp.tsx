'use client';

import React, { useState } from 'react';
import { useAuth } from '../utils/authUtils';
import Sidebar from '../components/sidebar/Sidebar';
import DashboardPage from '../components/dashboard/DashboardPage';
import BreweryPage from '../components/brewery/BreweryPage';
import ExperienceRegisterPage from '../components/experience/register/ExperienceRegisterPage';
import ExperienceListPage from '../components/experience/list/ExperienceListPage';
import ReservationStatusPage from '../components/reservations/status/ReservationStatusPage';
import PhoneReservationPage from '../components/reservations/phone/PhoneReservationPage';
import ProductRegisterPage from '../components/products/register/ProductRegisterPage';
import ProductListPage from '../components/products/list/ProductListPage';
import DeliveryManagePage from '../components/products/deliveryManage/DeliveryManagePage';
import StockManagePage from '../components/products/stock/StockManagePage';
import StatisticsPage from '../components/statistics/StatisticsPage';
import Login from '../components/Login/Login';
import styles from './MainApp.module.css';

type PageKey = 
  | 'dashboard' 
  | 'brewery' 
  | 'experience-register' 
  | 'experience-list'
  | 'reservation-status' 
  | 'reservation-phone' 
  | 'reservation-block'
  | 'product-register' 
  | 'product-list' 
  | 'product-delivery'
  | 'statistics' 
  | 'settings';

const PAGES: Record<PageKey, React.ComponentType> = {
  'dashboard': DashboardPage,
  'brewery': BreweryPage,
  'experience-register': ExperienceRegisterPage,
  'experience-list': ExperienceListPage,
  'reservation-status': ReservationStatusPage,
  'reservation-phone': PhoneReservationPage,
  'reservation-block': () => <Placeholder text="예약 차단 설정" />,
  'product-register': ProductRegisterPage,
  'product-list': ProductListPage,
  'product-delivery': DeliveryManagePage,
  'statistics': StatisticsPage,
  'settings': () => <Placeholder text="설정" />,
};

function LoadingScreen() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <div className={styles.loadingTitle}>몽향의숲</div>
        <div className={styles.loadingText}>로딩중...</div>
      </div>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return <div className={styles.placeholder}>{text} 페이지 (준비중)</div>;
}

export default function MainApp() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const PageComponent = PAGES[currentPage] || PAGES.dashboard;

  return (
    <div className={styles.appContainer}>
      <Sidebar currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as PageKey)} />
      <main className={styles.mainContent}>
        <PageComponent />
      </main>
    </div>
  );
}