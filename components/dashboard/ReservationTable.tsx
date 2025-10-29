'use client';

import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import styles from './ReservationTable.module.css';

interface Reservation {
  id: number;
  name: string;
  program: string;
  date: string;
  time: string;
  people: number;
  status: '확정' | '대기' | '취소';
}

export default function ReservationTable() {
  const reservations: Reservation[] = [
    {
      id: 1,
      name: '김민수',
      program: '막걸리 빚기 체험',
      date: '2025-10-16',
      time: '14:00',
      people: 4,
      status: '확정'
    },
    {
      id: 2,
      name: '이지은',
      program: '전통주 시음회',
      date: '2025-10-17',
      time: '11:00',
      people: 2,
      status: '대기'
    },
    {
      id: 3,
      name: '박철수',
      program: '양조장 투어',
      date: '2025-10-18',
      time: '10:00',
      people: 6,
      status: '확정'
    },
    {
      id: 4,
      name: '정미영',
      program: '막걸리 빚기 체험',
      date: '2025-10-19',
      time: '15:00',
      people: 3,
      status: '확정'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '확정':
        return <CheckCircle size={16} className={styles.iconConfirmed} />;
      case '대기':
        return <Clock size={16} className={styles.iconPending} />;
      case '취소':
        return <XCircle size={16} className={styles.iconCancelled} />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case '확정':
        return styles.statusConfirmed;
      case '대기':
        return styles.statusPending;
      case '취소':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>최근 예약</h2>
        <button className={styles.viewAllButton}>전체보기</button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>예약자</th>
              <th>프로그램</th>
              <th>날짜</th>
              <th>시간</th>
              <th>인원</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(reservation => (
              <tr key={reservation.id}>
                <td className={styles.namecell}>{reservation.name}</td>
                <td>{reservation.program}</td>
                <td>{reservation.date}</td>
                <td>{reservation.time}</td>
                <td>{reservation.people}명</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(reservation.status)}`}>
                    {getStatusIcon(reservation.status)}
                    {reservation.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}