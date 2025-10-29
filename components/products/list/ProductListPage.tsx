'use client';

import React, { useState } from 'react';
import { Package, Edit2, Trash2, Search, AlertTriangle, XCircle, Plus, Minus, X, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ProductListPage.module.css';

interface Product {
  id: number;
  name: string;
  type: string;
  alcohol: number;
  volume: number;
  price: number;
  stock: number;
  safetyStock: number;
  status: 'active' | 'inactive';
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface StockHistory {
  id: number;
  productId: number;
  productName: string;
  type: 'in' | 'out' | 'adjust';
  quantity: number;
  beforeStock: number;
  afterStock: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export default function ProductListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'history'>('products');

  // 재고 조정 상태
  const [stockAdjustType, setStockAdjustType] = useState<'in' | 'out'>('in');
  const [stockAdjustQuantity, setStockAdjustQuantity] = useState('');
  const [stockAdjustReason, setStockAdjustReason] = useState('');

  // 샘플 데이터
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: '프리미엄 막걸리',
      type: '막걸리',
      alcohol: 6.0,
      volume: 750,
      price: 15000,
      stock: 120,
      safetyStock: 50,
      status: 'active',
      image: '/placeholder.jpg',
      createdAt: '2025-01-15',
      updatedAt: '2025-01-15'
    },
    {
      id: 2,
      name: '청명 약주',
      type: '약주',
      alcohol: 13.5,
      volume: 500,
      price: 35000,
      stock: 15,
      safetyStock: 20,
      status: 'active',
      image: '/placeholder.jpg',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-14'
    },
    {
      id: 3,
      name: '전통 소주',
      type: '증류주',
      alcohol: 25.0,
      volume: 375,
      price: 28000,
      stock: 0,
      safetyStock: 30,
      status: 'inactive',
      image: '/placeholder.jpg',
      createdAt: '2025-01-05',
      updatedAt: '2025-01-13'
    },
    {
      id: 4,
      name: '복분자주',
      type: '과실주',
      alcohol: 15.0,
      volume: 500,
      price: 25000,
      stock: 8,
      safetyStock: 15,
      status: 'active',
      image: '/placeholder.jpg',
      createdAt: '2025-01-08',
      updatedAt: '2025-01-15'
    }
  ]);

  const [stockHistory, setStockHistory] = useState<StockHistory[]>([
    {
      id: 1,
      productId: 1,
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
      productId: 2,
      productName: '청명 약주',
      type: 'out',
      quantity: 30,
      beforeStock: 45,
      afterStock: 15,
      reason: '온라인 판매',
      createdBy: '시스템',
      createdAt: '2025-01-14 16:20'
    }
  ]);

  // 제품 필터링
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || product.type === filterType;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // 재고 상태 확인
  const getStockStatus = (current: number, safety: number) => {
    if (current === 0) return { label: '품절', className: styles.outOfStock, color: 'danger' };
    if (current < safety) return { label: '부족', className: styles.lowStock, color: 'warning' };
    return { label: '정상', className: styles.inStock, color: 'success' };
  };

  // 상태 토글
  const handleToggleStatus = (id: number) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id
          ? { ...product, status: product.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString().split('T')[0] }
          : product
      )
    );
  };

  // 재고 조정
  const handleStockAdjustment = () => {
    if (!selectedProduct || !stockAdjustQuantity) {
      alert('수량을 입력해주세요.');
      return;
    }

    const quantity = parseInt(stockAdjustQuantity);
    if (quantity <= 0) {
      alert('올바른 수량을 입력해주세요.');
      return;
    }

    const currentStock = selectedProduct.stock;
    const newStock = stockAdjustType === 'in' 
      ? currentStock + quantity 
      : Math.max(0, currentStock - quantity);

    // 재고 업데이트
    setProducts(prev =>
      prev.map(product =>
        product.id === selectedProduct.id
          ? { ...product, stock: newStock, updatedAt: new Date().toISOString().split('T')[0] }
          : product
      )
    );

    // 이력 추가
    const newHistory: StockHistory = {
      id: stockHistory.length + 1,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: stockAdjustType,
      quantity,
      beforeStock: currentStock,
      afterStock: newStock,
      reason: stockAdjustReason || (stockAdjustType === 'in' ? '입고' : '출고'),
      createdBy: '관리자',
      createdAt: new Date().toLocaleString('ko-KR')
    };

    setStockHistory(prev => [newHistory, ...prev]);

    // 초기화
    setIsStockModalOpen(false);
    setSelectedProduct(null);
    setStockAdjustQuantity('');
    setStockAdjustReason('');
    setStockAdjustType('in');

    alert('재고가 조정되었습니다.');
  };

  // 제품 삭제
  const handleDelete = (id: number, name: string) => {
    if (confirm(`'${name}'을(를) 삭제하시겠습니까?`)) {
      setProducts(prev => prev.filter(product => product.id !== id));
      alert('제품이 삭제되었습니다.');
    }
  };

  // 제품 수정 (간단한 예시)
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // 재고 조정 모달 열기
  const openStockModal = (product: Product) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  // 재고 부족 및 품절 제품 수 계산
  const lowStockCount = products.filter(p => p.stock < p.safetyStock && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>제품 관리</h1>
          <p className={styles.subtitle}>제품 목록과 재고를 통합 관리합니다</p>
        </div>
      </div>

      {/* 경고 카드 */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className={styles.alertSection}>
          {lowStockCount > 0 && (
            <div className={styles.alertCard}>
              <div className={styles.alertIcon}>
                <AlertTriangle size={32} />
              </div>
              <div>
                <div className={styles.alertTitle}>재고 부족</div>
                <div className={styles.alertValue}>{lowStockCount}개 제품</div>
              </div>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className={`${styles.alertCard} ${styles.alertDanger}`}>
              <div className={styles.alertIcon}>
                <XCircle size={32} />
              </div>
              <div>
                <div className={styles.alertTitle}>품절</div>
                <div className={styles.alertValue}>{outOfStockCount}개 제품</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 탭 메뉴 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => setActiveTab('products')}
        >
          제품 목록
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          입출고 내역
        </button>
      </div>

      {/* 제품 목록 탭 */}
      {activeTab === 'products' && (
        <>
          {/* 필터 및 검색 */}
          <div className={styles.filterSection}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="제품명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filters}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">전체 주종</option>
                <option value="막걸리">막걸리</option>
                <option value="청주">청주</option>
                <option value="약주">약주</option>
                <option value="증류주">증류주</option>
                <option value="과실주">과실주</option>
                <option value="리큐르">리큐르</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">전체 상태</option>
                <option value="active">판매중</option>
                <option value="inactive">판매중지</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="recent">최신순</option>
                <option value="name">이름순</option>
                <option value="price">가격순</option>
                <option value="stock">재고순</option>
              </select>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>전체 제품</div>
              <div className={styles.statValue}>{products.length}개</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>판매중</div>
              <div className={styles.statValue}>
                {products.filter(p => p.status === 'active').length}개
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>총 재고</div>
              <div className={styles.statValue}>
                {products.reduce((sum, p) => sum + p.stock, 0)}개
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>재고 가치</div>
              <div className={styles.statValue}>
                {products.reduce((sum, p) => sum + (p.stock * p.price), 0).toLocaleString()}원
              </div>
            </div>
          </div>

          {/* 제품 테이블 */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>이미지</th>
                  <th>제품명</th>
                  <th>주종</th>
                  <th>도수</th>
                  <th>용량</th>
                  <th>가격</th>
                  <th>현재 재고</th>
                  <th>안전 재고</th>
                  <th>재고 상태</th>
                  <th>판매 상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className={styles.emptyRow}>
                      등록된 제품이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const stockStatus = getStockStatus(product.stock, product.safetyStock);
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className={styles.productImage}>
                            <Camera size={24} color="#9ca3af" />
                          </div>
                        </td>
                        <td>
                          <div className={styles.productName}>{product.name}</div>
                        </td>
                        <td>
                          <span className={styles.typeBadge}>{product.type}</span>
                        </td>
                        <td>{product.alcohol}%</td>
                        <td>{product.volume}ml</td>
                        <td className={styles.price}>
                          {product.price.toLocaleString()}원
                        </td>
                        <td className={stockStatus.className}>
                          {product.stock}개
                        </td>
                        <td>{product.safetyStock}개</td>
                        <td>
                          <span className={`${styles.stockStatus} ${styles[stockStatus.color]}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`${styles.statusToggle} ${product.status === 'active' ? styles.active : styles.inactive}`}
                            onClick={() => handleToggleStatus(product.id)}
                          >
                            {product.status === 'active' ? '판매중' : '판매중지'}
                          </button>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button 
                              className={styles.stockBtn}
                              onClick={() => openStockModal(product)}
                              title="재고 조정"
                            >
                              <Package size={16} />
                            </button>
                            <button 
                              className={styles.editBtn}
                              onClick={() => handleEdit(product)}
                              title="수정"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className={styles.deleteBtn}
                              onClick={() => handleDelete(product.id, product.name)}
                              title="삭제"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 입출고 내역 탭 */}
      {activeTab === 'history' && (
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
      )}

      {/* 재고 조정 모달 */}
      {isStockModalOpen && selectedProduct && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>재고 조정</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setIsStockModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.selectedProductInfo}>
                <div className={styles.label}>제품명</div>
                <div className={styles.productInfo}>
                  {selectedProduct.name}
                </div>
                <div className={styles.currentStock}>
                  현재 재고: {selectedProduct.stock}개
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>조정 유형</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radio}>
                    <input
                      type="radio"
                      value="in"
                      checked={stockAdjustType === 'in'}
                      onChange={(e) => setStockAdjustType(e.target.value as 'in' | 'out')}
                    />
                    <Plus size={16} style={{ marginLeft: '4px' }} />
                    <span>입고</span>
                  </label>
                  <label className={styles.radio}>
                    <input
                      type="radio"
                      value="out"
                      checked={stockAdjustType === 'out'}
                      onChange={(e) => setStockAdjustType(e.target.value as 'in' | 'out')}
                    />
                    <Minus size={16} style={{ marginLeft: '4px' }} />
                    <span>출고</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>수량</label>
                <input
                  type="number"
                  value={stockAdjustQuantity}
                  onChange={(e) => setStockAdjustQuantity(e.target.value)}
                  className={styles.input}
                  placeholder="조정할 수량을 입력하세요"
                  min="1"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>사유</label>
                <textarea
                  value={stockAdjustReason}
                  onChange={(e) => setStockAdjustReason(e.target.value)}
                  className={styles.textarea}
                  placeholder="재고 조정 사유를 입력하세요"
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsStockModalOpen(false)}
              >
                취소
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleStockAdjustment}
              >
                재고 조정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <button className={styles.pageBtn}>
          <ChevronLeft size={16} />
          <span>이전</span>
        </button>
        <div className={styles.pageNumbers}>
          <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>3</button>
        </div>
        <button className={styles.pageBtn}>
          <span>다음</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}