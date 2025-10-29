'use client';

import React, { useState } from 'react';
import styles from './StockManagePage.module.css';

interface StockHistory {
  id: number;
  productName: string;
  type: 'in' | 'out' | 'adjust';
  quantity: number;
  beforeStock: number;
  afterStock: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  type: string;
  currentStock: number;
  safetyStock: number;
  price: number;
}

export default function StockManagePage() {
  const [activeTab, setActiveTab] = useState<'manage' | 'history'>('manage');
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // 샘플 데이터
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: '프리미엄 막걸리',
      type: '막걸리',
      currentStock: 120,
      safetyStock: 50,
      price: 15000
    },
    {
      id: 2,
      name: '청명 약주',
      type: '약주',
      currentStock: 15,
      safetyStock: 20,
      price: 35000
    },
    {
      id: 3,
      name: '전통 소주',
      type: '증류주',
      currentStock: 0,
      safetyStock: 30,
      price: 28000
    }
  ]);

  const [stockHistory] = useState<StockHistory[]>([
    {
      id: 1,
      productName: '프리미엄 막걸리',
      type: 'in',
      quantity: 100,
      beforeStock: 20,
      afterStock: 120,
      reason: '신규 입고',
      createdBy: '관리자',
      createdAt: '2025-01-15 14:30'
    },
    {
      id: 2,
      productName: '청명 약주',
      type: 'out',
      quantity: 30,
      beforeStock: 45,
      afterStock: 15,
      reason: '온라인 판매',
      createdBy: '시스템',
      createdAt: '2025-01-14 16:20'
    },
    {
      id: 3,
      productName: '전통 소주',
      type: 'adjust',
      quantity: -5,
      beforeStock: 5,
      afterStock: 0,
      reason: '파손',
      createdBy: '관리자',
      createdAt: '2025-01-13 11:15'
    }
  ]);

  const getStockStatus = (current: number, safety: number) => {
    if (current === 0) return { label: '품절', className: styles.statusDanger };
    if (current < safety) return { label: '부족', className: styles.statusWarning };
    return { label: '정상', className: styles.statusNormal };
  };

  const handleStockAdjust = () => {
    if (!selectedProduct || !adjustQuantity) {
      alert('제품과 수량을 입력해주세요.');
      return;
    }

    const quantity = parseInt(adjustQuantity);
    if (quantity <= 0) {
      alert('올바른 수량을 입력해주세요.');
      return;
    }

    // API 호출 로직
    console.log('재고 조정:', {
      productId: selectedProduct,
      type: adjustType,
      quantity,
      reason: adjustReason
    });

    alert('재고가 조정되었습니다.');
    setSelectedProduct(null);
    setAdjustQuantity('');
    setAdjustReason('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>재고 관리</h1>
          <p className={styles.subtitle}>제품 재고를 관리하고 입출고 내역을 확인합니다</p>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'manage' ? styles.active : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          재고 현황 및 조정
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          입출고 내역
        </button>
      </div>

      {/* 재고 관리 탭 */}
      {activeTab === 'manage' && (
        <div className={styles.content}>
          {/* 알림 카드 */}
          <div className={styles.alertCards}>
            <div className={styles.alertCard}>
              <div className={styles.alertIcon}>⚠️</div>
              <div>
                <div className={styles.alertTitle}>안전 재고 부족</div>
                <div className={styles.alertText}>
                  {products.filter(p => p.currentStock < p.safetyStock && p.currentStock > 0).length}개 제품
                </div>
              </div>
            </div>
            <div className={`${styles.alertCard} ${styles.danger}`}>
              <div className={styles.alertIcon}>🚫</div>
              <div>
                <div className={styles.alertTitle}>품절 제품</div>
                <div className={styles.alertText}>
                  {products.filter(p => p.currentStock === 0).length}개 제품
                </div>
              </div>
            </div>
          </div>

          <div className={styles.mainGrid}>
            {/* 재고 현황 테이블 */}
            <div className={styles.tableSection}>
              <h2 className={styles.sectionTitle}>재고 현황</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>제품명</th>
                      <th>주종</th>
                      <th>현재 재고</th>
                      <th>안전 재고</th>
                      <th>상태</th>
                      <th>재고 가치</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => {
                      const status = getStockStatus(product.currentStock, product.safetyStock);
                      return (
                        <tr
                          key={product.id}
                          className={selectedProduct === product.id ? styles.selected : ''}
                          onClick={() => setSelectedProduct(product.id)}
                        >
                          <td className={styles.productName}>{product.name}</td>
                          <td>
                            <span className={styles.typeBadge}>{product.type}</span>
                          </td>
                          <td className={styles.stockNumber}>
                            {product.currentStock}개
                          </td>
                          <td>{product.safetyStock}개</td>
                          <td>
                            <span className={status.className}>
                              {status.label}
                            </span>
                          </td>
                          <td className={styles.price}>
                            {(product.currentStock * product.price).toLocaleString()}원
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 재고 조정 패널 */}
            <div className={styles.adjustPanel}>
              <h2 className={styles.sectionTitle}>재고 조정</h2>
              
              {selectedProduct ? (
                <div className={styles.adjustForm}>
                  <div className={styles.selectedProduct}>
                    <div className={styles.label}>선택된 제품</div>
                    <div className={styles.productInfo}>
                      {products.find(p => p.id === selectedProduct)?.name}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>조정 유형</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radio}>
                        <input
                          type="radio"
                          value="in"
                          checked={adjustType === 'in'}
                          onChange={(e) => setAdjustType(e.target.value as 'in' | 'out')}
                        />
                        <span>입고</span>
                      </label>
                      <label className={styles.radio}>
                        <input
                          type="radio"
                          value="out"
                          checked={adjustType === 'out'}
                          onChange={(e) => setAdjustType(e.target.value as 'in' | 'out')}
                        />
                        <span>출고</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>수량</label>
                    <input
                      type="number"
                      value={adjustQuantity}
                      onChange={(e) => setAdjustQuantity(e.target.value)}
                      className={styles.input}
                      placeholder="조정할 수량을 입력하세요"
                      min="1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>사유</label>
                    <textarea
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      className={styles.textarea}
                      placeholder="재고 조정 사유를 입력하세요"
                      rows={3}
                    />
                  </div>

                  <button
                    className={styles.submitBtn}
                    onClick={handleStockAdjust}
                  >
                    재고 조정하기
                  </button>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📦</div>
                  <div className={styles.emptyText}>
                    왼쪽 목록에서 제품을 선택하세요
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 입출고 내역 탭 */}
      {activeTab === 'history' && (
        <div className={styles.content}>
          <div className={styles.historySection}>
            <div className={styles.historyHeader}>
              <h2 className={styles.sectionTitle}>입출고 내역</h2>
              <div className={styles.historyFilters}>
                <select className={styles.filterSelect}>
                  <option value="all">전체</option>
                  <option value="in">입고</option>
                  <option value="out">출고</option>
                  <option value="adjust">조정</option>
                </select>
                <input
                  type="date"
                  className={styles.dateInput}
                />
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>일시</th>
                    <th>제품명</th>
                    <th>구분</th>
                    <th>변동 수량</th>
                    <th>변동 전</th>
                    <th>변동 후</th>
                    <th>사유</th>
                    <th>처리자</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory.map(history => (
                    <tr key={history.id}>
                      <td>{history.createdAt}</td>
                      <td className={styles.productName}>{history.productName}</td>
                      <td>
                        <span className={
                          history.type === 'in' ? styles.typeIn :
                          history.type === 'out' ? styles.typeOut :
                          styles.typeAdjust
                        }>
                          {history.type === 'in' ? '입고' :
                           history.type === 'out' ? '출고' : '조정'}
                        </span>
                      </td>
                      <td className={
                        history.type === 'in' ? styles.quantityIn :
                        history.type === 'out' ? styles.quantityOut :
                        styles.quantityAdjust
                      }>
                        {history.type === 'in' ? '+' : history.type === 'out' ? '-' : ''}
                        {history.quantity}개
                      </td>
                      <td>{history.beforeStock}개</td>
                      <td>{history.afterStock}개</td>
                      <td>{history.reason}</td>
                      <td>{history.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}