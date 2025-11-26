'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  OrderItem,
  getOrderHistoryByPage,
  getFulfillmentStatusText,
  getRefundStatusText,
  formatOrderDate,
  formatPrice
} from '../../../utils/orderApi';
import styles from './DeliveryManagePage.module.css';

export default function DeliveryManagePage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 12;
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refundFilter, setRefundFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchOrders = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    
    const result = await getOrderHistoryByPage(page, PAGE_SIZE);
    
    if (result.success && result.data) {
      setOrders(result.data.content);
      setFilteredOrders(result.data.content);
      setTotalPages(result.data.total_pages);
      setTotalElements(result.data.total_elements);
      setCurrentPage(result.data.number);
    } else {
      setError(result.error || '데이터를 불러올 수 없습니다.');
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders(0);
  }, [fetchOrders]);

  useEffect(() => {
    let filtered = orders;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.order_item_fulfillment_status === filterStatus);
    }

    if (refundFilter !== 'all') {
      filtered = filtered.filter(o => o.order_item_refund_status === refundFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.product_name.toLowerCase().includes(term) ||
        o.payer_name.toLowerCase().includes(term) ||
        o.payer_phone.includes(term) ||
        o.payer_address.toLowerCase().includes(term) ||
        String(o.order_id).includes(term)
      );
    }

    setFilteredOrders(filtered);
  }, [filterStatus, refundFilter, searchTerm, orders]);

  const getFulfillmentStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
      'CREATED': styles.statusPending,
      'ALLOCATED': styles.statusPreparing,
      'SHIPPED': styles.statusShipping,
      'DELIVERED': styles.statusDelivered,
      'CANCELLED': styles.statusCancelled
    };
    return classMap[status] || '';
  };

  const getRefundStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
      'NONE': '',
      'REQUESTED': styles.refundRequested,
      'APPROVED': styles.refundApproved,
      'REJECTED': styles.refundRejected,
      'COMPLETED': styles.refundCompleted
    };
    return classMap[status] || '';
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(filteredOrders.map(o => o.order_item_id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedItems(newSelected);
  };

  const openDetailModal = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const openHistoryModal = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsHistoryModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      fetchOrders(page);
      setSelectedItems(new Set());
    }
  };

  const getStatusCount = (status: string): number => {
    return orders.filter(o => o.order_item_fulfillment_status === status).length;
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else if (currentPage < 3) {
      for (let i = 0; i < maxVisible; i++) pages.push(i);
    } else if (currentPage > totalPages - 4) {
      for (let i = totalPages - maxVisible; i < totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    
    return pages;
  };

  if (loading && orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>주문 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorWrapper}>
          <p>{error}</p>
          <button onClick={() => fetchOrders(0)} className={styles.retryBtn}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>배송 관리</h1>
        <div className={styles.summary}>
          <span>전체 주문: {totalElements}건</span>
          <span>주문 생성: {getStatusCount('CREATED')}건</span>
          <span>상품 할당: {getStatusCount('ALLOCATED')}건</span>
          <span>배송중: {getStatusCount('SHIPPED')}건</span>
          <span>배송 완료: {getStatusCount('DELIVERED')}건</span>
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <select 
            className={styles.filterSelect} 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">전체 배송상태</option>
            <option value="CREATED">주문 생성</option>
            <option value="ALLOCATED">상품 할당</option>
            <option value="SHIPPED">배송중</option>
            <option value="DELIVERED">배송 완료</option>
            <option value="CANCELLED">배송 취소</option>
          </select>

          <select 
            className={styles.filterSelect} 
            value={refundFilter} 
            onChange={(e) => setRefundFilter(e.target.value)}
          >
            <option value="all">전체 환불상태</option>
            <option value="NONE">환불 없음</option>
            <option value="REQUESTED">환불 요청</option>
            <option value="APPROVED">환불 승인</option>
            <option value="COMPLETED">환불 완료</option>
          </select>

          <input
            type="text"
            placeholder="주문번호, 상품명, 주문자명, 연락처 검색"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          className={styles.refreshBtn}
          onClick={() => fetchOrders(currentPage)}
          disabled={loading}
        >
          {loading ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      {selectedItems.size > 0 && (
        <div className={styles.bulkActions}>
          <span className={styles.selectedCount}>
            {selectedItems.size}개 선택됨
          </span>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.deliveryTable}>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredOrders.length > 0 && selectedItems.size === filteredOrders.length}
                />
              </th>
              <th>주문번호</th>
              <th>상품명</th>
              <th>수량</th>
              <th>결제금액</th>
              <th>주문자</th>
              <th>배송지</th>
              <th>배송상태</th>
              <th>환불상태</th>
              <th>운송정보</th>
              <th>주문일시</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={12} className={styles.emptyMessage}>
                  주문 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr 
                  key={order.order_item_id} 
                  className={selectedItems.has(order.order_item_id) ? styles.selectedRow : ''}
                >
                  <td>
                    <input 
                      type="checkbox"
                      checked={selectedItems.has(order.order_item_id)}
                      onChange={() => handleSelectItem(order.order_item_id)}
                    />
                  </td>
                  <td className={styles.orderNumber}>
                    #{order.order_id}-{order.order_item_id}
                  </td>
                  <td className={styles.productName}>{order.product_name}</td>
                  <td>{order.order_item_quantity}개</td>
                  <td className={styles.price}>
                    {formatPrice(order.order_item_amount)}
                  </td>
                  <td>
                    <div className={styles.customerInfo}>
                      <span>{order.payer_name}</span>
                      <span className={styles.customerPhone}>{order.payer_phone}</span>
                    </div>
                  </td>
                  <td className={styles.address}>
                    {order.payer_address} {order.payer_address_detail}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getFulfillmentStatusClass(order.order_item_fulfillment_status)}`}>
                      {getFulfillmentStatusText(order.order_item_fulfillment_status)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.refundBadge} ${getRefundStatusClass(order.order_item_refund_status)}`}>
                      {getRefundStatusText(order.order_item_refund_status)}
                    </span>
                  </td>
                  <td>
                    {order.order_item_tracking_no ? (
                      <div className={styles.trackingInfo}>
                        <span>{order.order_item_carrier_code}</span>
                        <span className={styles.trackingNumber}>{order.order_item_tracking_no}</span>
                      </div>
                    ) : (
                      <span className={styles.noTracking}>미등록</span>
                    )}
                  </td>
                  <td className={styles.dateCell}>
                    {formatOrderDate(order.order_item_created_at)}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.detailBtn}
                        onClick={() => openDetailModal(order)}
                      >
                        상세
                      </button>
                      <button 
                        className={styles.historyBtn}
                        onClick={() => openHistoryModal(order)}
                      >
                        이력
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn}
            onClick={() => handlePageChange(0)}
            disabled={currentPage === 0}
          >
            처음
          </button>
          <button 
            className={styles.pageBtn}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            이전
          </button>
          
          <div className={styles.pageNumbers}>
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                className={`${styles.pageNum} ${currentPage === pageNum ? styles.active : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum + 1}
              </button>
            ))}
          </div>

          <button 
            className={styles.pageBtn}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            다음
          </button>
          <button 
            className={styles.pageBtn}
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
          >
            마지막
          </button>
          
          <span className={styles.pageInfo}>
            {currentPage + 1} / {totalPages} 페이지
          </span>
        </div>
      )}

      {isDetailModalOpen && selectedOrder && (
        <div className={styles.modal} onClick={() => setIsDetailModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>주문 상세 정보</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setIsDetailModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>주문 정보</h3>
                <div className={styles.detailRow}>
                  <span className={styles.label}>주문번호:</span>
                  <span>#{selectedOrder.order_id}-{selectedOrder.order_item_id}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>상품명:</span>
                  <span>{selectedOrder.product_name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>수량:</span>
                  <span>{selectedOrder.order_item_quantity}개</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>결제금액:</span>
                  <span className={styles.price}>{formatPrice(selectedOrder.order_item_amount)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>주문일시:</span>
                  <span>{formatOrderDate(selectedOrder.order_item_created_at)}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>주문자 정보</h3>
                <div className={styles.detailRow}>
                  <span className={styles.label}>주문자명:</span>
                  <span>{selectedOrder.payer_name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>연락처:</span>
                  <span>{selectedOrder.payer_phone}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>배송지:</span>
                  <span>{selectedOrder.payer_address}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>상세주소:</span>
                  <span>{selectedOrder.payer_address_detail}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>배송 정보</h3>
                <div className={styles.detailRow}>
                  <span className={styles.label}>배송상태:</span>
                  <span className={`${styles.statusBadge} ${getFulfillmentStatusClass(selectedOrder.order_item_fulfillment_status)}`}>
                    {getFulfillmentStatusText(selectedOrder.order_item_fulfillment_status)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>환불상태:</span>
                  <span className={`${styles.refundBadge} ${getRefundStatusClass(selectedOrder.order_item_refund_status)}`}>
                    {getRefundStatusText(selectedOrder.order_item_refund_status)}
                  </span>
                </div>
                {selectedOrder.order_item_carrier_code && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>택배사:</span>
                    <span>{selectedOrder.order_item_carrier_code}</span>
                  </div>
                )}
                {selectedOrder.order_item_tracking_no && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>운송장번호:</span>
                    <span>{selectedOrder.order_item_tracking_no}</span>
                  </div>
                )}
                {selectedOrder.order_item_shipped_at && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>발송일시:</span>
                    <span>{formatOrderDate(selectedOrder.order_item_shipped_at)}</span>
                  </div>
                )}
                {selectedOrder.order_item_delivered_at && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>배송완료:</span>
                    <span>{formatOrderDate(selectedOrder.order_item_delivered_at)}</span>
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <h3>판매자 정보</h3>
                <div className={styles.detailRow}>
                  <span className={styles.label}>판매자:</span>
                  <span>{selectedOrder.provider_nickname}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>판매자 유형:</span>
                  <span>{selectedOrder.provider_role === 'ROLE_BREWERY' ? '양조장' : '일반 판매자'}</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setIsDetailModalOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {isHistoryModalOpen && selectedOrder && (
        <div className={styles.modal} onClick={() => setIsHistoryModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>상태 변경 이력</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setIsHistoryModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>배송 상태 이력</h3>
                {selectedOrder.status_history.fulfillment_history.length > 0 ? (
                  <div className={styles.historyList}>
                    {selectedOrder.status_history.fulfillment_history.map((history) => (
                      <div key={history.order_item_fulfillment_history_id} className={styles.historyItem}>
                        <div className={styles.historyStatus}>
                          <span className={`${styles.statusBadge} ${getFulfillmentStatusClass(history.order_item_fulfillment_history_to_status)}`}>
                            {getFulfillmentStatusText(history.order_item_fulfillment_history_to_status)}
                          </span>
                        </div>
                        <div className={styles.historyDetail}>
                          <span className={styles.historyReason}>
                            사유: {history.order_item_fulfillment_history_reason_code}
                          </span>
                          <span className={styles.historyDate}>
                            {formatOrderDate(history.order_item_fulfillment_history_created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyHistory}>배송 상태 이력이 없습니다.</p>
                )}
              </div>

              <div className={styles.detailSection}>
                <h3>환불 상태 이력</h3>
                {selectedOrder.status_history.refund_history.length > 0 ? (
                  <div className={styles.historyList}>
                    {selectedOrder.status_history.refund_history.map((history) => (
                      <div key={history.order_item_refund_history_id} className={styles.historyItem}>
                        <div className={styles.historyStatus}>
                          <span className={`${styles.refundBadge} ${getRefundStatusClass(history.order_item_refund_to_status)}`}>
                            {getRefundStatusText(history.order_item_refund_to_status)}
                          </span>
                        </div>
                        <div className={styles.historyDetail}>
                          <span className={styles.historyDate}>
                            {formatOrderDate(history.order_item_refund_created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyHistory}>환불 상태 이력이 없습니다.</p>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setIsHistoryModalOpen(false)}
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