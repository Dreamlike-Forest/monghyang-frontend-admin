'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/authUtils';
import Sidebar from '../components/sidebar/Sidebar';
import DashboardPage from '../components/dashboard/DashboardPage';
import BreweryPage from '../components/brewery/BreweryPage';
import ExperienceRegisterPage from '../components/experience/register/ExperienceRegisterPage';
import ExperienceListPage from '../components/experience/list/ExperienceListPage';
import SchedulePage from '../components/experience/schedule/SchedulePage';
import ReservationStatusPage from '../components/reservations/status/ReservationStatusPage';
import PhoneReservationPage from '../components/reservations/phone/PhoneReservationPage';
import ProductRegisterPage from '../components/products/register/ProductRegisterPage';
import ProductListPage from '../components/products/list/ProductListPage';
import DeliveryManagePage from '../components/products/deliveryManage/DeliveryManagePage';
import StockManagePage from '../components/products/stock/StockManagePage';
import StatisticsPage from '../components/statistics/StatisticsPage';
import Login from '../components/Login/Login';
import styles from './MainApp.module.css';

export default function MainApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            marginBottom: '16px',
            color: '#8b5a3c'
          }}>몽향의숲</div>
          <div style={{ color: '#6b7280' }}>로딩중...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'brewery':
        return <BreweryPage />;
      case 'experience-register':
        return <ExperienceRegisterPage />;
      case 'experience-list':
        return <ExperienceListPage />;
      case 'experience-schedule':
        return <SchedulePage />;
      case 'reservation-status':
        return <ReservationStatusPage />;
      case 'reservation-phone':
        return <PhoneReservationPage />;
      case 'reservation-block':
        return <div style={{ padding: '30px' }}>예약 차단 설정 페이지 (준비중)</div>;
      case 'product-register':
        return <ProductRegisterPage />;
      case 'product-list':
        return <ProductListPage />;
      case 'product-delivery':
        return <DeliveryManagePage />;
      case 'statistics':
        return <StatisticsPage/>;
      case 'settings':
        return <div style={{ padding: '30px' }}>설정 페이지 (준비중)</div>;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className={styles.mainContent}>
        {renderPage()}
      </main>
    </div>
  );
}