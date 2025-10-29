'use client';

import React, { useState } from 'react';
import styles from './ReservationStatusPage.module.css';

interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  programName: string;
  date: string;
  time: string;
  participants: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  memo?: string;
  createdAt: string;
}

export default function ReservationStatusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // 예약 데이터 (실제로는 API에서 가져옴)
  const [reservations] = useState<Reservation[]>([
    {
      id: 'RSV-2024-001',
      customerName: '김철수',
      phone: '010-1234-5678',
      programName: '전통주 빚기 체험',
      date: '2025-10-20',
      time: '14:00',
      participants: 4,
      status: 'confirmed',
      totalAmount: 120000,
      paymentStatus: 'paid',
      memo: '주차 필요',
      createdAt: '2025-10-10 09:30'
    },
    {
      id: 'RSV-2024-002',
      customerName: '이영희',
      phone: '010-9876-5432',
      programName: '막걸리 테이스팅',
      date: '2025-10-18',
      time: '11:00',
      participants: 2,
      status: 'pending',
      totalAmount: 60000,
      paymentStatus: 'unpaid',
      createdAt: '2025-10-14 14:20'
    },
    {
      id: 'RSV-2024-003',
      customerName: '박민수',
      phone: '010-5555-7777',
      programName: '양조장 투어',
      date: '2025-10-15',
      time: '10:00',
      participants: 6,
      status: 'completed',
      totalAmount: 90000,
      paymentStatus: 'paid',
      createdAt: '2025-10-05 16:45'
    }
  ]);

  const statusLabels = {
    pending: '예약 대기',
    confirmed: '예약 확정',
    completed: '체험 완료',
    cancelled: '예약 취소'
  };

  const statusColors = {
    pending: '#fbbf24',
    confirmed: '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444'
  };

  const paymentLabels = {
    unpaid: '미결제',
    partial: '부분결제',
    paid: '결제완료'
  };

  // 필터링된 예약 목록
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.customerName.includes(searchTerm) ||
      reservation.phone.includes(searchTerm) ||
      reservation.id.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    const matchesDate = !filterDate || reservation.date === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusChange = (reservationId: string, newStatus: string) => {
    console.log(`예약 ${reservationId}의 상태를 ${newStatus}로 변경`);
    // 실제로는 API 호출
  };

  const handleDeleteReservation = (reservationId: string) => {
    if (window.confirm('정말 이 예약을 삭제하시겠습니까?')) {
      console.log(`예약 ${reservationId} 삭제`);
      // 실제로는 API 호출
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>예약 현황</h1>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>총 예약</span>
            <span className={styles.summaryValue}>{reservations.length}건</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>예약 대기</span>
            <span className={styles.summaryValue}>
              {reservations.filter(r => r.status === 'pending').length}건
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>예약 확정</span>
            <span className={styles.summaryValue}>
              {reservations.filter(r => r.status === 'confirmed').length}건
            </span>
          </div>
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="예약자명, 전화번호, 예약번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">전체 상태</option>
            <option value="pending">예약 대기</option>
            <option value="confirmed">예약 확정</option>
            <option value="completed">체험 완료</option>
            <option value="cancelled">예약 취소</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={styles.dateInput}
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterDate('');
            }}
            className={styles.resetButton}
          >
            필터 초기화
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>예약번호</th>
              <th>예약자</th>
              <th>연락처</th>
              <th>프로그램</th>
              <th>체험일시</th>
              <th>인원</th>
              <th>금액</th>
              <th>결제상태</th>
              <th>예약상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.emptyState}>
                  조회된 예약이 없습니다.
                </td>
              </tr>
            ) : (
              filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className={styles.reservationId}>{reservation.id}</td>
                  <td>{reservation.customerName}</td>
                  <td>{reservation.phone}</td>
                  <td>{reservation.programName}</td>
                  <td>
                    {reservation.date} {reservation.time}
                  </td>
                  <td>{reservation.participants}명</td>
                  <td>{reservation.totalAmount.toLocaleString()}원</td>
                  <td>
                    <span className={styles.paymentBadge}>
                      {paymentLabels[reservation.paymentStatus]}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: statusColors[reservation.status] }}
                    >
                      {statusLabels[reservation.status]}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className={styles.detailButton}
                      >
                        상세
                      </button>
                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className={styles.deleteButton}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 상세 정보 모달 */}
      {selectedReservation && (
        <div className={styles.modal} onClick={() => setSelectedReservation(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>예약 상세 정보</h2>
              <button
                onClick={() => setSelectedReservation(null)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>예약번호</span>
                <span className={styles.detailValue}>{selectedReservation.id}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>예약자</span>
                <span className={styles.detailValue}>{selectedReservation.customerName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>연락처</span>
                <span className={styles.detailValue}>{selectedReservation.phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>프로그램</span>
                <span className={styles.detailValue}>{selectedReservation.programName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>체험일시</span>
                <span className={styles.detailValue}>
                  {selectedReservation.date} {selectedReservation.time}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>참가인원</span>
                <span className={styles.detailValue}>{selectedReservation.participants}명</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>총 금액</span>
                <span className={styles.detailValue}>
                  {selectedReservation.totalAmount.toLocaleString()}원
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>결제상태</span>
                <span className={styles.detailValue}>
                  {paymentLabels[selectedReservation.paymentStatus]}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>예약상태</span>
                <select
                  value={selectedReservation.status}
                  onChange={(e) => handleStatusChange(selectedReservation.id, e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="pending">예약 대기</option>
                  <option value="confirmed">예약 확정</option>
                  <option value="completed">체험 완료</option>
                  <option value="cancelled">예약 취소</option>
                </select>
              </div>
              {selectedReservation.memo && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>메모</span>
                  <span className={styles.detailValue}>{selectedReservation.memo}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>예약일시</span>
                <span className={styles.detailValue}>{selectedReservation.createdAt}</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setSelectedReservation(null)}
                className={styles.closeModalButton}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}