'use client';

import React, { useState, useEffect } from 'react';
import styles from './ReservationStatusPage.module.css';
import {
  fetchReservationHistory,
  fetchReservationHistoryByDate,
  cancelReservation,
  deleteReservation,
  ReservationOrder
} from '../../../utils/experienceApi';

export default function ReservationStatusPage() {
  const [reservations, setReservations] = useState<ReservationOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<ReservationOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const statusLabels = {
    PENDING: '대기중',
    PAID: '결제됨',
    CANCELED: '취소됨',
    FAILED: '실패함'
  };

  const statusColors = {
    PENDING: '#3b82f6',
    PAID: '#10b981',
    CANCELED: '#6b7280',
    FAILED: '#ef4444'
  };

  useEffect(() => {
    loadReservations();
  }, [currentPage]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await fetchReservationHistory(currentPage);
      setReservations(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      alert('예약 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadReservationsByDate = async (date: string) => {
    try {
      setLoading(true);
      const data = await fetchReservationHistoryByDate(currentPage, date);
      setReservations(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      alert('예약 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (joyOrderId: number) => {
    if (!window.confirm('정말 이 예약을 취소(환불)하시겠습니까?')) return;

    const result = await cancelReservation(joyOrderId);
    if (result.success) {
      alert(result.message);
      loadReservations();
    } else {
      alert(result.error);
    }
  };

  const handleDeleteReservation = async (joyOrderId: number) => {
    if (!window.confirm('정말 이 예약을 삭제하시겠습니까?')) return;

    const result = await deleteReservation(joyOrderId);
    if (result.success) {
      alert(result.message);
      loadReservations();
    } else {
      alert(result.error);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.joy_order_payer_name.includes(searchTerm) ||
      reservation.joy_order_payer_phone.includes(searchTerm) ||
      String(reservation.joy_order_id).includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || reservation.joy_payment_status === filterStatus;
    const matchesDate = !filterDate || reservation.joy_order_reservation.startsWith(filterDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

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
            <span className={styles.summaryLabel}>결제 완료</span>
            <span className={styles.summaryValue}>
              {reservations.filter(r => r.joy_payment_status === 'PAID').length}건
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>대기중</span>
            <span className={styles.summaryValue}>
              {reservations.filter(r => r.joy_payment_status === 'PENDING').length}건
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
            <option value="PENDING">대기중</option>
            <option value="PAID">결제됨</option>
            <option value="CANCELED">취소됨</option>
            <option value="FAILED">실패함</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              if (e.target.value) {
                loadReservationsByDate(e.target.value);
              } else {
                loadReservations();
              }
            }}
            className={styles.dateInput}
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterDate('');
              loadReservations();
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
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className={styles.emptyState}>
                  로딩 중...
                </td>
              </tr>
            ) : filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.emptyState}>
                  조회된 예약이 없습니다.
                </td>
              </tr>
            ) : (
              filteredReservations.map((reservation) => (
                <tr key={reservation.joy_order_id}>
                  <td className={styles.reservationId}>{reservation.joy_order_id}</td>
                  <td>{reservation.joy_order_payer_name}</td>
                  <td>{reservation.joy_order_payer_phone}</td>
                  <td>{reservation.joy_name}</td>
                  <td>{reservation.joy_order_reservation}</td>
                  <td>{reservation.joy_order_count}명</td>
                  <td>{reservation.joy_total_price.toLocaleString()}원</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: statusColors[reservation.joy_payment_status] }}
                    >
                      {statusLabels[reservation.joy_payment_status]}
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
                      {reservation.joy_payment_status === 'PAID' && (
                        <button
                          onClick={() => handleCancelReservation(reservation.joy_order_id)}
                          className={styles.deleteButton}
                        >
                          취소
                        </button>
                      )}
                      {(reservation.joy_payment_status === 'CANCELED' || 
                        reservation.joy_payment_status === 'FAILED' ||
                        reservation.joy_payment_status === 'PENDING') && (
                        <button
                          onClick={() => handleDeleteReservation(reservation.joy_order_id)}
                          className={styles.deleteButton}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e5e7eb',
                background: currentPage === i ? '#7a3118' : 'white',
                color: currentPage === i ? 'white' : '#374151',
                cursor: 'pointer',
                borderRadius: '0.375rem'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

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
                <span className={styles.detailValue}>{selectedReservation.joy_order_id}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>예약자</span>
                <span className={styles.detailValue}>{selectedReservation.joy_order_payer_name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>연락처</span>
                <span className={styles.detailValue}>{selectedReservation.joy_order_payer_phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>프로그램</span>
                <span className={styles.detailValue}>{selectedReservation.joy_name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>체험일시</span>
                <span className={styles.detailValue}>{selectedReservation.joy_order_reservation}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>참가인원</span>
                <span className={styles.detailValue}>{selectedReservation.joy_order_count}명</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>총 금액</span>
                <span className={styles.detailValue}>
                  {selectedReservation.joy_total_price.toLocaleString()}원
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>결제상태</span>
                <span className={styles.detailValue}>
                  {statusLabels[selectedReservation.joy_payment_status]}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>예약일시</span>
                <span className={styles.detailValue}>{selectedReservation.joy_order_created_at}</span>
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