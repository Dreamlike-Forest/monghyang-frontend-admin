'use client';

import React from 'react';
import { Clock, Users } from 'lucide-react';
import styles from './TodaySchedule.module.css';

interface Schedule {
  id: number;
  time: string;
  program: string;
  people: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export default function TodaySchedule() {
  const schedules: Schedule[] = [
    {
      id: 1,
      time: '10:00',
      program: '양조장 투어',
      people: 6,
      status: 'completed'
    },
    {
      id: 2,
      time: '14:00',
      program: '막걸리 빚기 체험',
      people: 4,
      status: 'in-progress'
    },
    {
      id: 3,
      time: '16:00',
      program: '전통주 시음회',
      people: 8,
      status: 'upcoming'
    }
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.completed;
      case 'in-progress':
        return styles.inProgress;
      case 'upcoming':
        return styles.upcoming;
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

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>오늘의 일정</h3>
      <div className={styles.scheduleList}>
        {schedules.map(schedule => (
          <div key={schedule.id} className={`${styles.scheduleItem} ${getStatusClass(schedule.status)}`}>
            <div className={styles.timeColumn}>
              <Clock size={16} className={styles.clockIcon} />
              <span className={styles.time}>{schedule.time}</span>
            </div>
            <div className={styles.detailsColumn}>
              <p className={styles.programName}>{schedule.program}</p>
              <div className={styles.meta}>
                <Users size={14} />
                <span>{schedule.people}명</span>
                <span className={styles.statusBadge}>
                  {getStatusLabel(schedule.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}