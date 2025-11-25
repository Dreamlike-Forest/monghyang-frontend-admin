'use client';

import React, { useState, useEffect } from 'react';
import styles from './ReservationStatusPage.module.css';
import {
  fetchReservationHistory,
  fetchReservationHistoryByDate,
  deleteReservation,
  ReservationOrder
} from '../../../utils/experienceApi';

interface Reservation {
  id: number;
  customerName: string;
  phone: string;
  programName: string;
  date: string;
  time: string;
  participants: number;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export default function ReservationStatusPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadReservations();
  }, [currentPage, filterDate]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (filterDate) {
        data = await fetchReservationHistoryByDate(currentPage, filterDate);
      } else {
        data = await fetchReservationHistory(currentPage);
      }

      const mappedReservations: Reservation[] = data.content.map((order: ReservationOrder) => ({
        id: order.joy_order_id,
        customerName: order.joy_order_payer_name,
        phone: order.joy_order_payer_phone,
        programName: order.joy_name,
        date: order.joy_order_reservation.split('T')[0],
        time: order.joy_order_reservation.split('T')[1]?.substring(0, 5) || '',
        participants: order.joy_order_count,
        status: mapPaymentStatusToReservationStatus(order.joy_payment_status),
        totalAmount: order.joy_total_price,
        paymentStatus: mapPaymentStatus(order.joy_payment_status),
        createdAt: new Date(order.joy_order_created_at).toLocaleString('ko-KR')
      }));

      if (currentPage === 0) {
        setReservations(mappedReservations);
      } else {
        setReservations(prev => [...prev, ...mappedReservations]);
      }

      setTotalPages(data.totalPages);
      setHasMore(!data.last);
    } catch (err) {
      setError('예약 내역을 불러오는데 실패했습니다.');
      console.error('예약 내역 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const mapPaymentStatusToReservationStatus = (status: string): string => {
    switch (status) {
      case 'PAID':
        return 'confirmed';
      case 'PENDING':
        return 'pending';
      case 'UNPAID':
        return 'pending';
      case 'CANCELLED':
        return 'cancelled';
      case 'REFUND':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const mapPaymentStatus = (status: string): string => {
    switch (status) {
      case 'PAID':
        return 'paid';
      case 'PENDING':
        return 'partial';
      case 'UNPAID':
        return 'unpaid';
      case 'CANCELLED':
        return 'unpaid';
      case 'REFUND':
        return 'unpaid';
      default:
        return 'unpaid';
    }
  };

  const statusLabels: Record<string, string> = {
    pending: '예약 대기',
    confirmed: '예약 확정',
    completed: '체험 완료',
    cancelled: '예약 취소'
  };

  const statusColors: Record<string, string> = {
    pending: '#fbbf24',
    confirmed: '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444'
  };

  const paymentLabels: Record<string, string> = {
    unpaid: '미결제',
    partial: '부분결제',
    paid: '결제완료'
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.customerName.includes(searchTerm) ||
      reservation.phone.includes(searchTerm) ||
      String(reservation.id).includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteReservation = async (reservationId: number) => {
    if (!window.confirm('정말 이 예약을 삭제하시겠습니까?')) return;

    try {
      const result = await deleteReservation(reservationId);
      if (result.success) {
        alert(result.message);
        setCurrentPage(0);
        await loadReservations();
      } else {
        alert(result.error || '예약 삭제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('예약 삭제 중 오류가 발생했습니다.');
      console.error('예약 삭제 오류:', err);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleDateFilterChange = (date: string) => {
    setFilterDate(date);
    setCurrentPage(0);
    setReservations([]);
  };

  if (loading && currentPage === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>예약 내역을 불러오는 중...</div>
      </div>
    );
  }

  if (error && reservations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error}
          <button onClick={loadReservations} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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
            onChange={(e) => handleDateFilterChange(e.target.value)}
            className={styles.dateInput}
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterDate('');
              setCurrentPage(0);
              setReservations([]);
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

      {hasMore && !loading && (
        <div className={styles.loadMoreContainer}>
          <button onClick={handleLoadMore} className={styles.loadMoreButton}>
            더 보기
          </button>
        </div>
      )}

      {loading && currentPage > 0 && (
        <div className={styles.loadingMore}>추가 데이터를 불러오는 중...</div>
      )}

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
                <span className={styles.detailValue}>
                  {statusLabels[selectedReservation.status]}
                </span>
              </div>
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