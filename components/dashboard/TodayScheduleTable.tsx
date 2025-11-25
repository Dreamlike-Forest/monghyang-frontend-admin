'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, Phone, User, CheckCircle, XCircle } from 'lucide-react';
import { TodaySchedule } from '../../utils/statisticsApi';
import styles from './TodayScheduleTable.module.css';

interface TodayScheduleTableProps {
  schedule: TodaySchedule[];
}

export default function TodayScheduleTable({ schedule }: TodayScheduleTableProps) {
  const router = useRouter();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getScheduleStatus = (reservationTime: string): 'upcoming' | 'in-progress' | 'completed' => {
    const now = new Date();
    const reservation = new Date(reservationTime);
    const diffInHours = (reservation.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < -2) {
      return 'completed';
    } else if (diffInHours < 0) {
      return 'in-progress';
    } else {
      return 'upcoming';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'in-progress':
        return styles.statusInProgress;
      case 'upcoming':
        return styles.statusUpcoming;
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'in-progress':
        return '진행중';
      case 'upcoming':
        return '예정';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle size={16} />;
    } else if (status === 'in-progress') {
      return <Clock size={16} />;
    } else {
      return <Clock size={16} />;
    }
  };

  const handleViewAll = () => {
    router.push('/reservation-status');
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>오늘의 일정</h2>
        <button className={styles.viewAllButton} onClick={handleViewAll}>
          전체보기
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className={styles.emptyState}>
          <Clock size={48} className={styles.emptyIcon} />
          <p className={styles.emptyMessage}>오늘 예정된 일정이 없습니다</p>
        </div>
      ) : (
        <div className={styles.scheduleList}>
          {schedule.map(item => {
            const status = getScheduleStatus(item.reservationTime);
            return (
              <div key={item.joyOrderId} className={`${styles.scheduleItem} ${getStatusClass(status)}`}>
                <div className={styles.timeSection}>
                  <div className={styles.timeDisplay}>
                    <Clock size={20} className={styles.clockIcon} />
                    <span className={styles.time}>{formatTime(item.reservationTime)}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
                    {getStatusIcon(status)}
                    {getStatusLabel(status)}
                  </span>
                </div>

                <div className={styles.contentSection}>
                  <h3 className={styles.programName}>{item.joyName}</h3>
                  
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <User size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>예약자</span>
                        <span className={styles.detailValue}>{item.payerName}</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <Users size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>인원</span>
                        <span className={styles.detailValue}>{item.participantCount}명</span>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <Phone size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>연락처</span>
                        <span className={styles.detailValue}>{item.payerPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}