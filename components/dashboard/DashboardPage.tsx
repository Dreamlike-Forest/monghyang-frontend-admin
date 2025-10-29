'use client';

import React from 'react';
import StatCard from './StatCard';
import ReservationTable from './ReservationTable';
import QuickActions from './QuickActions';
import TodaySchedule from './TodaySchedule';
import styles from './DashboardPage.module.css';

interface StatData {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconType: 'calendar' | 'package' | 'trending';
}

export default function DashboardPage() {
  const stats: StatData[] = [
    {
      id: 'reservations',
      title: '이번 달 예약',
      value: '89건',
      change: '+23.1%',
      isPositive: true,
      iconType: 'calendar'
    },
    {
      id: 'products',
      title: '전통주 판매',
      value: '456개',
      change: '-5.3%',
      isPositive: false,
      iconType: 'package'
    },
    {
      id: 'revenue',
      title: '월 매출',
      value: '₩15,234,000',
      change: '+18.2%',
      isPositive: true,
      iconType: 'trending'
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>대시보드</h1>

      {/* 통계 카드 섹션 */}
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

      {/* 메인 콘텐츠 그리드 */}
      <div className={styles.mainGrid}>
        {/* 왼쪽: 예약 테이블 */}
        <section className={styles.leftSection}>
          <ReservationTable />
        </section>

        {/* 오른쪽: 퀵 액션 & 오늘 일정 */}
        <aside className={styles.rightSection}>
          <QuickActions />
          <TodaySchedule />
        </aside>
      </div>
    </div>
  );
}