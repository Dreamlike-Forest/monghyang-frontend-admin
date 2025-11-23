'use client';

import React, { useState, useEffect } from 'react';
import styles from './DeliveryManagePage.module.css';

interface DeliveryItem {
  id: string;
  orderNumber: string;
  orderDate: string;
  productName: string;
  quantity: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryStatus: 'pending' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
  deliveryCompany?: string;
  trackingNumber?: string;
  memo?: string;
  totalPrice: number;
}

export default function DeliveryManagePage() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 일괄 처리를 위한 state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [isBulkTrackingModalOpen, setIsBulkTrackingModalOpen] = useState(false);
  const [bulkDeliveryCompany, setBulkDeliveryCompany] = useState('CJ대한통운');
  const [bulkTrackingNumbers, setBulkTrackingNumbers] = useState<{[key: string]: string}>({});

  // 샘플 데이터 로드
  useEffect(() => {
    const sampleDeliveries: DeliveryItem[] = [
      {
        id: '1',
        orderNumber: 'ORD-2025-0001',
        orderDate: '2025-01-04',
        productName: '청산별곡 막걸리',
        quantity: 3,
        customerName: '김민수',
        customerPhone: '010-1234-5678',
        deliveryAddress: '부산광역시 해운대구 우동 123-45 해운대아파트 101동 1501호',
        deliveryStatus: 'pending',
        totalPrice: 45000
      },
      {
        id: '2',
        orderNumber: 'ORD-2025-0002',
        orderDate: '2025-01-04',
        productName: '산막 증류소주',
        quantity: 2,
        customerName: '이영희',
        customerPhone: '010-2345-6789',
        deliveryAddress: '부산광역시 남구 대연동 456-78 대연빌라 201호',
        deliveryStatus: 'preparing',
        deliveryCompany: '대한통운',
        trackingNumber: '1234567890',
        totalPrice: 60000
      },
      {
        id: '3',
        orderNumber: 'ORD-2025-0003',
        orderDate: '2025-01-03',
        productName: '몽향 약주',
        quantity: 5,
        customerName: '박철수',
        customerPhone: '010-3456-7890',
        deliveryAddress: '부산광역시 부산진구 부전동 789-12 부전타워 301호',
        deliveryStatus: 'shipping',
        deliveryCompany: '우체국택배',
        trackingNumber: '0987654321',
        totalPrice: 125000
      },
      {
        id: '4',
        orderNumber: 'ORD-2025-0004',
        orderDate: '2025-01-02',
        productName: '청산별곡 막걸리',
        quantity: 10,
        customerName: '정미경',
        customerPhone: '010-4567-8901',
        deliveryAddress: '부산광역시 동래구 온천동 345-67 온천아파트 102동 803호',
        deliveryStatus: 'delivered',
        deliveryCompany: 'CJ대한통운',
        trackingNumber: '5678901234',
        totalPrice: 150000
      },
      {
        id: '5',
        orderNumber: 'ORD-2025-0005',
        orderDate: '2025-01-04',
        productName: '산막 증류소주',
        quantity: 1,
        customerName: '최준호',
        customerPhone: '010-5678-9012',
        deliveryAddress: '부산광역시 사하구 괴정동 234-56 괴정빌딩 401호',
        deliveryStatus: 'pending',
        totalPrice: 30000
      }
    ];

    setDeliveries(sampleDeliveries);
    setFilteredDeliveries(sampleDeliveries);
  }, []);

  // 필터링 적용
  useEffect(() => {
    let filtered = deliveries;

    // 상태 필터
    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => d.deliveryStatus === filterStatus);
    }

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDeliveries(filtered);
  }, [filterStatus, searchTerm, deliveries]);

  // 배송 상태 한글 변환
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '배송 대기',
      'preparing': '배송 준비중',
      'shipping': '배송중',
      'delivered': '배송 완료',
      'cancelled': '배송 취소'
    };
    return statusMap[status] || status;
  };

  // 배송 상태별 스타일 클래스
  const getStatusClass = (status: string) => {
    const classMap: { [key: string]: string } = {
      'pending': styles.statusPending,
      'preparing': styles.statusPreparing,
      'shipping': styles.statusShipping,
      'delivered': styles.statusDelivered,
      'cancelled': styles.statusCancelled
    };
    return classMap[status] || '';
  };

  // 체크박스 처리
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(filteredDeliveries.map(d => d.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // 일괄 배송 상태 변경
  const handleBulkStatusChange = (newStatus: DeliveryItem['deliveryStatus']) => {
    setDeliveries(prev => prev.map(d => 
      selectedItems.has(d.id) ? { ...d, deliveryStatus: newStatus } : d
    ));
    setSelectedItems(new Set());
    setIsBulkStatusModalOpen(false);
  };

  // 송장번호 일괄 입력 모달 열기
  const openBulkTrackingModal = () => {
    // 선택된 항목들의 송장번호 초기값 설정
    const initialNumbers: {[key: string]: string} = {};
    selectedItems.forEach(id => {
      const delivery = deliveries.find(d => d.id === id);
      if (delivery) {
        initialNumbers[id] = delivery.trackingNumber || '';
      }
    });
    setBulkTrackingNumbers(initialNumbers);
    setIsBulkTrackingModalOpen(true);
  };

  // 송장번호 일괄 저장
  const handleBulkTrackingSave = () => {
    setDeliveries(prev => prev.map(d => {
      if (selectedItems.has(d.id) && bulkTrackingNumbers[d.id]) {
        return { 
          ...d, 
          deliveryCompany: bulkDeliveryCompany,
          trackingNumber: bulkTrackingNumbers[d.id],
          deliveryStatus: d.deliveryStatus === 'pending' ? 'preparing' : d.deliveryStatus
        };
      }
      return d;
    }));
    setSelectedItems(new Set());
    setIsBulkTrackingModalOpen(false);
  };

  // 배송 상세 모달 열기
  const openDetailModal = (delivery: DeliveryItem) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  // 배송 상태 업데이트
  const updateDeliveryStatus = (id: string, newStatus: DeliveryItem['deliveryStatus']) => {
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, deliveryStatus: newStatus } : d
    ));
    setIsModalOpen(false);
  };

  // 송장번호 업데이트
  const updateTrackingInfo = (id: string, company: string, trackingNumber: string) => {
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, deliveryCompany: company, trackingNumber: trackingNumber } : d
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>배송 관리</h1>
        <div className={styles.summary}>
          <span>전체 주문: {deliveries.length}건</span>
          <span>배송 대기: {deliveries.filter(d => d.deliveryStatus === 'pending').length}건</span>
          <span>배송중: {deliveries.filter(d => d.deliveryStatus === 'shipping').length}건</span>
        </div>
      </div>

      {/* 필터 및 검색 섹션 */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <select 
            className={styles.filterSelect} 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="pending">배송 대기</option>
            <option value="preparing">배송 준비중</option>
            <option value="shipping">배송중</option>
            <option value="delivered">배송 완료</option>
            <option value="cancelled">배송 취소</option>
          </select>

          <input
            type="text"
            placeholder="주문번호, 고객명, 제품명, 주소 검색"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className={styles.exportBtn}>
          엑셀 다운로드
        </button>
      </div>

      {/* 일괄 처리 버튼 */}
      {selectedItems.size > 0 && (
        <div className={styles.bulkActions}>
          <span className={styles.selectedCount}>
            {selectedItems.size}개 선택됨
          </span>
          <button 
            className={styles.bulkStatusBtn}
            onClick={() => setIsBulkStatusModalOpen(true)}
          >
            배송상태 일괄변경
          </button>
          <button 
            className={styles.bulkTrackingBtn}
            onClick={openBulkTrackingModal}
          >
            송장번호 일괄입력
          </button>
        </div>
      )}

      {/* 배송 목록 테이블 */}
      <div className={styles.tableWrapper}>
        <table className={styles.deliveryTable}>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredDeliveries.length > 0 && selectedItems.size === filteredDeliveries.length}
                />
              </th>
              <th>주문번호</th>
              <th>주문일</th>
              <th>제품명</th>
              <th>수량</th>
              <th>고객명</th>
              <th>배송지</th>
              <th>배송상태</th>
              <th>송장번호</th>
              <th>금액</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map((delivery) => (
              <tr key={delivery.id} className={selectedItems.has(delivery.id) ? styles.selectedRow : ''}>
                <td>
                  <input 
                    type="checkbox"
                    checked={selectedItems.has(delivery.id)}
                    onChange={() => handleSelectItem(delivery.id)}
                  />
                </td>
                <td className={styles.orderNumber}>{delivery.orderNumber}</td>
                <td>{delivery.orderDate}</td>
                <td>{delivery.productName}</td>
                <td>{delivery.quantity}개</td>
                <td>
                  <div className={styles.customerInfo}>
                    <span>{delivery.customerName}</span>
                    <span className={styles.customerPhone}>{delivery.customerPhone}</span>
                  </div>
                </td>
                <td className={styles.address}>{delivery.deliveryAddress}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(delivery.deliveryStatus)}`}>
                    {getStatusText(delivery.deliveryStatus)}
                  </span>
                </td>
                <td>
                  {delivery.trackingNumber ? (
                    <div className={styles.trackingInfo}>
                      <span>{delivery.deliveryCompany}</span>
                      <span className={styles.trackingNumber}>{delivery.trackingNumber}</span>
                    </div>
                  ) : (
                    <span className={styles.noTracking}>-</span>
                  )}
                </td>
                <td className={styles.price}>₩{delivery.totalPrice.toLocaleString()}</td>
                <td>
                  <button 
                    className={styles.detailBtn}
                    onClick={() => openDetailModal(delivery)}
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 일괄 배송상태 변경 모달 */}
      {isBulkStatusModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>배송상태 일괄 변경</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setIsBulkStatusModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>
                선택한 {selectedItems.size}개 주문의 배송상태를 변경합니다.
              </p>
              <div className={styles.statusOptions}>
                <button 
                  className={`${styles.statusOption} ${styles.optionPending}`}
                  onClick={() => handleBulkStatusChange('pending')}
                >
                  배송 대기
                </button>
                <button 
                  className={`${styles.statusOption} ${styles.optionPreparing}`}
                  onClick={() => handleBulkStatusChange('preparing')}
                >
                  배송 준비중
                </button>
                <button 
                  className={`${styles.statusOption} ${styles.optionShipping}`}
                  onClick={() => handleBulkStatusChange('shipping')}
                >
                  배송중
                </button>
                <button 
                  className={`${styles.statusOption} ${styles.optionDelivered}`}
                  onClick={() => handleBulkStatusChange('delivered')}
                >
                  배송 완료
                </button>
                <button 
                  className={`${styles.statusOption} ${styles.optionCancelled}`}
                  onClick={() => handleBulkStatusChange('cancelled')}
                >
                  배송 취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 송장번호 일괄 입력 모달 */}
      {isBulkTrackingModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>송장번호 일괄 입력</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setIsBulkTrackingModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.companySection}>
                <label>택배사 선택:</label>
                <select 
                  className={styles.companySelect}
                  value={bulkDeliveryCompany}
                  onChange={(e) => setBulkDeliveryCompany(e.target.value)}
                >
                  <option value="CJ대한통운">CJ대한통운</option>
                  <option value="한진택배">한진택배</option>
                  <option value="우체국택배">우체국택배</option>
                  <option value="롯데택배">롯데택배</option>
                  <option value="로젠택배">로젠택배</option>
                  <option value="쿠팡로켓배송">쿠팡로켓배송</option>
                </select>
              </div>
              
              <div className={styles.trackingInputSection}>
                <p className={styles.inputDescription}>
                  각 주문의 송장번호를 입력하세요:
                </p>
                <div className={styles.trackingInputList}>
                  {Array.from(selectedItems).map(id => {
                    const delivery = deliveries.find(d => d.id === id);
                    if (!delivery) return null;
                    return (
                      <div key={id} className={styles.trackingInputRow}>
                        <div className={styles.orderInfo}>
                          <span className={styles.orderNum}>{delivery.orderNumber}</span>
                          <span className={styles.customerName}>{delivery.customerName}</span>
                        </div>
                        <input
                          type="text"
                          className={styles.trackingInput}
                          placeholder="송장번호 입력"
                          value={bulkTrackingNumbers[id] || ''}
                          onChange={(e) => setBulkTrackingNumbers({
                            ...bulkTrackingNumbers,
                            [id]: e.target.value
                          })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.saveBtn}
                onClick={handleBulkTrackingSave}
              >
                저장
              </button>
              <button 
                className={styles.cancelBtn}
                onClick={() => setIsBulkTrackingModalOpen(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 배송 상세 모달 (기존) */}
      {isModalOpen && selectedDelivery && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>배송 상세 정보</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>주문 정보</h3>
                <div className={styles.detailRow}>
                  <span className={styles.label}>주문번호:</span>
                  <span>{selectedDelivery.orderNumber}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>주문일:</span>
                  <span>{selectedDelivery.orderDate}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>제품명:</span>
                  <span>{selectedDelivery.productName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>수량:</span>
                  <span>{selectedDelivery.quantity}개</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>금액:</span>
                  <span>₩{selectedDelivery.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>고객 정보</h3>
                <div className={styles.detailRow}>
                  <span className={styles.label}>고객명:</span>
                  <span>{selectedDelivery.customerName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>연락처:</span>
                  <span>{selectedDelivery.customerPhone}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>배송지:</span>
                  <span>{selectedDelivery.deliveryAddress}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>배송 정보</h3>
                <div className={styles.detailRow}>
                  <span className={styles.label}>배송 상태:</span>
                  <select 
                    className={styles.statusSelect}
                    value={selectedDelivery.deliveryStatus}
                    onChange={(e) => updateDeliveryStatus(selectedDelivery.id, e.target.value as DeliveryItem['deliveryStatus'])}
                  >
                    <option value="pending">배송 대기</option>
                    <option value="preparing">배송 준비중</option>
                    <option value="shipping">배송중</option>
                    <option value="delivered">배송 완료</option>
                    <option value="cancelled">배송 취소</option>
                  </select>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>택배사:</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={selectedDelivery.deliveryCompany || ''}
                    placeholder="택배사 입력"
                    onChange={(e) => {
                      setSelectedDelivery({...selectedDelivery, deliveryCompany: e.target.value});
                    }}
                  />
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>송장번호:</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={selectedDelivery.trackingNumber || ''}
                    placeholder="송장번호 입력"
                    onChange={(e) => {
                      setSelectedDelivery({...selectedDelivery, trackingNumber: e.target.value});
                    }}
                  />
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>메모</h3>
                <textarea
                  className={styles.memoTextarea}
                  placeholder="배송 관련 메모를 입력하세요"
                  value={selectedDelivery.memo || ''}
                  onChange={(e) => {
                    setSelectedDelivery({...selectedDelivery, memo: e.target.value});
                  }}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.saveBtn}
                onClick={() => {
                  if (selectedDelivery.deliveryCompany && selectedDelivery.trackingNumber) {
                    updateTrackingInfo(
                      selectedDelivery.id, 
                      selectedDelivery.deliveryCompany, 
                      selectedDelivery.trackingNumber
                    );
                  }
                  setIsModalOpen(false);
                }}
              >
                저장
              </button>
              <button 
                className={styles.cancelBtn}
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}