'use client';

import React, { useState } from 'react';
import { useAuth } from '../utils/authUtils';
import Sidebar from '../components/sidebar/Sidebar';
import DashboardPage from '../components/dashboard/DashboardPage';
import BreweryPage from '../components/brewery/BreweryPage';
import ExperienceRegisterPage from '../components/experience/register/ExperienceRegisterPage';
import ExperienceListPage from '../components/experience/list/ExperienceListPage';
import ReservationStatusPage from '../components/reservations/status/ReservationStatusPage';
import OfflineReservationPage from '../components/reservations/Offline/OfflineReservationPage';
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
  | 'reservation-offline' 
  | 'reservation-block'
  | 'product-register' 
  | 'product-list' 
  | 'product-delivery'
  | 'statistics' 
  | 'settings';

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

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageKey);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'brewery':
        return <BreweryPage />;
      case 'experience-register':
        return <ExperienceRegisterPage />;
      case 'experience-list':
        return <ExperienceListPage />;
      case 'reservation-status':
        return <ReservationStatusPage />;
      case 'reservation-phone':
      case 'reservation-offline':
        return <OfflineReservationPage />;
      case 'reservation-block':
        return <Placeholder text="예약 차단 설정" />;
      case 'product-register':
        return <ProductRegisterPage />;
      case 'product-list':
        return <ProductListPage />;
      case 'product-delivery':
        return <DeliveryManagePage />;
      case 'statistics':
        return <StatisticsPage />;
      case 'settings':
        return <Placeholder text="설정" />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className={styles.mainContent}>
        {renderPage()}
      </main>
    </div>
  );
}