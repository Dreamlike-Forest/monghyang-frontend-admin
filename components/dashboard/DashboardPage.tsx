'use client';

import React, { useEffect, useState } from 'react';
import StatCard from './StatCard';
import TodayScheduleTable from './TodayScheduleTable';
import QuickActions from './QuickActions';
import { fetchDashboardData, DashboardData } from '../../utils/dashboardApi';
import styles from './DashboardPage.module.css';

interface StatData {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconType: 'calendar' | 'package' | 'trending';
}

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('대시보드 데이터 로딩 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const stats: StatData[] = dashboardData ? [
    {
      id: 'today-revenue',
      title: '오늘 매출',
      value: formatCurrency(dashboardData.stats.todayRevenue),
      change: '',
      isPositive: true,
      iconType: 'trending'
    },
    {
      id: 'today-orders',
      title: '오늘 주문',
      value: `${dashboardData.stats.todayOrderCount}건`,
      change: '',
      isPositive: true,
      iconType: 'package'
    },
    {
      id: 'today-reservations',
      title: '오늘 예약',
      value: `${dashboardData.stats.todayJoyReservationCount}건`,
      change: '',
      isPositive: true,
      iconType: 'calendar'
    }
  ] : [];

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>대시보드</h1>
        <div className={styles.loadingText}>데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>대시보드</h1>
        <div className={styles.loadingText}>{error}</div>
        <button onClick={loadDashboardData} style={{ marginTop: '1rem' }}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>대시보드</h1>

      <section className={styles.statsSection}>
        {stats.map(stat => (
          <StatCard 
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            iconType={stat.iconType}
          />
        ))}
      </section>

      <div className={styles.mainGrid}>
        <section className={styles.leftSection}>
          <TodayScheduleTable schedule={dashboardData?.todaySchedule || []} />
        </section>

        <aside className={styles.rightSection}>
          <QuickActions onNavigate={onNavigate} />
        </aside>
      </div>
    </div>
  );
}