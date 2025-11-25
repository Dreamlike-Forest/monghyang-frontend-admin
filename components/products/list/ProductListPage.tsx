'use client';

import React, { useState, useEffect } from 'react';
import { Package, Edit2, Trash2, Search, AlertTriangle, XCircle, ChevronLeft, ChevronRight, Camera, ToggleLeft, ToggleRight, Plus, Minus, RotateCcw, X } from 'lucide-react';
import styles from './ProductListPage.module.css';
import { 
  getMyProducts,
  deleteProduct,
  restoreProduct,
  setSoldout,
  unsetSoldout,
  increaseInventory,
  decreaseInventory,
  Product,
  ProductListResponse
} from '../../../utils/productApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';

type ModalType = 'increase' | 'decrease' | null;

interface InventoryModalData {
  productId: number;
  productName: string;
  type: ModalType;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<InventoryModalData | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    loadProducts();
  }, [currentPage, filterStatus]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMyProducts(currentPage);

      let filteredProducts = response.content;
      
      if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
          p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (filterStatus === 'active') {
        filteredProducts = filteredProducts.filter(p => !p.product_is_soldout);
      } else if (filterStatus === 'inactive') {
        filteredProducts = filteredProducts.filter(p => p.product_is_soldout);
      }

      setProducts(filteredProducts);
      setTotalProducts(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('제품 목록 조회 실패:', err);
      setError(err.response?.data?.message || '제품 목록을 불러오는데 실패했습니다. 로그인 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSoldout = async (product: Product) => {
    try {
      let result;
      if (product.product_is_soldout) {
        result = await unsetSoldout(product.product_id);
      } else {
        result = await setSoldout(product.product_id);
      }
      
      if (result.success) {
        alert(result.message);
        loadProducts();
      } else {
        alert(result.error);
      }
    } catch (err: any) {
      console.error('품절 상태 변경 실패:', err);
      alert('품절 상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`'${name}'을(를) 삭제하시겠습니까?`)) {
      try {
        const result = await deleteProduct(id);
        if (result.success) {
          alert(result.message);
          loadProducts();
        } else {
          alert(result.error);
        }
      } catch (err: any) {
        console.error('삭제 실패:', err);
        alert('제품 삭제에 실패했습니다.');
      }
    }
  };

  const handleRestore = async (id: number, name: string) => {
    if (confirm(`'${name}'을(를) 복구하시겠습니까?`)) {
      try {
        const result = await restoreProduct(id);
        if (result.success) {
          alert(result.message);
          loadProducts();
        } else {
          alert(result.error);
        }
      } catch (err: any) {
        console.error('복구 실패:', err);
        alert('제품 복구에 실패했습니다.');
      }
    }
  };

  const openInventoryModal = (product: Product, type: 'increase' | 'decrease') => {
    setModalData({
      productId: product.product_id,
      productName: product.product_name,
      type
    });
    setQuantity(1);
    setModalOpen(true);
  };

  const closeInventoryModal = () => {
    setModalOpen(false);
    setModalData(null);
    setQuantity(1);
  };

  const handleInventorySubmit = async () => {
    if (!modalData || quantity <= 0) {
      alert('수량을 올바르게 입력해주세요.');
      return;
    }

    try {
      let result;
      if (modalData.type === 'increase') {
        result = await increaseInventory(modalData.productId, quantity);
      } else {
        result = await decreaseInventory(modalData.productId, quantity);
      }

      if (result.success) {
        alert(result.message);
        closeInventoryModal();
        loadProducts();
      } else {
        alert(result.error);
      }
    } catch (err: any) {
      console.error('재고 변경 실패:', err);
      alert('재고 변경에 실패했습니다.');
    }
  };

  const handleEdit = (product: Product) => {
    alert('제품 수정 기능은 제품 등록 페이지를 이용해주세요.');
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadProducts();
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const getImageUrl = (imageKey: string | undefined) => {
    if (!imageKey) return '';
    return `${API_BASE_URL}/api/image/${imageKey}`;
  };

  const soldoutCount = products.filter(p => p.product_is_soldout).length;
  const activeCount = products.filter(p => !p.product_is_soldout).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.iconWrapper}>
            <Package className={styles.icon} />
          </div>
          <div>
            <h1 className={styles.title}>제품 관리</h1>
            <p className={styles.subtitle}>등록된 제품을 관리합니다</p>
          </div>
        </div>
      </div>

      {soldoutCount > 0 && (
        <div className={styles.alertSection}>
          <div className={`${styles.alertCard} ${styles.alertDanger}`}>
            <div className={styles.alertIcon}>
              <XCircle size={32} />
            </div>
            <div>
              <div className={styles.alertTitle}>품절</div>
              <div className={styles.alertValue}>{soldoutCount}개 제품</div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="제품명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
            <option value="active">판매중</option>
            <option value="inactive">품절</option>
          </select>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>전체 제품</div>
          <div className={styles.statValue}>{totalProducts}개</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>판매중</div>
          <div className={styles.statValue}>{activeCount}개</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>품절</div>
          <div className={styles.statValue} style={{ color: '#dc2626' }}>
            {soldoutCount}개
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>총 판매량</div>
          <div className={styles.statValue}>
            {products.reduce((sum, p) => sum + p.product_sales_volume, 0)}개
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이미지</th>
              <th>제품명</th>
              <th>도수</th>
              <th>용량</th>
              <th>정가</th>
              <th>할인율</th>
              <th>판매가</th>
              <th>판매량</th>
              <th>온라인 판매</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '40px' }}>
                  로딩 중...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '40px' }}>
                  등록된 제품이 없습니다.
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.product_id}>
                  <td>
                    <div className={styles.productImage}>
                      {product.image_key ? (
                        <img 
                          src={getImageUrl(product.image_key)} 
                          alt={product.product_name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Camera size={24} color="#9ca3af" />
                      )}
                    </div>
                  </td>
                  <td className={styles.productName}>{product.product_name}</td>
                  <td>{product.product_alcohol}%</td>
                  <td>{product.product_volume}ml</td>
                  <td className={styles.price}>
                    {parseFloat(product.product_origin_price).toLocaleString()}원
                  </td>
                  <td>{parseFloat(product.product_discount_rate).toFixed(1)}%</td>
                  <td className={styles.price}>
                    {parseFloat(product.product_final_price).toLocaleString()}원
                  </td>
                  <td>{product.product_sales_volume}개</td>
                  <td>
                    <span className={product.product_is_online_sell ? styles.onlineBadge : styles.offlineBadge}>
                      {product.product_is_online_sell ? '가능' : '불가'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`${styles.toggleBtn} ${product.product_is_soldout ? styles.soldout : styles.active}`}
                      onClick={() => handleToggleSoldout(product)}
                      title={product.product_is_soldout ? '품절 해제하기' : '품절 처리하기'}
                    >
                      {product.product_is_soldout ? (
                        <>
                          <ToggleLeft size={16} />
                          <span>품절</span>
                        </>
                      ) : (
                        <>
                          <ToggleRight size={16} />
                          <span>판매중</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.increaseBtn}
                        onClick={() => openInventoryModal(product, 'increase')}
                        title="재고 입고"
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                        className={styles.decreaseBtn}
                        onClick={() => openInventoryModal(product, 'decrease')}
                        title="재고 출고"
                      >
                        <Minus size={16} />
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
                        onClick={() => handleDelete(product.product_id, product.product_name)}
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className={styles.restoreBtn}
                        onClick={() => handleRestore(product.product_id, product.product_name)}
                        title="복구"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button 
          className={styles.pageBtn}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <ChevronLeft size={16} />
          <span>이전</span>
        </button>
        <div className={styles.pageNumbers}>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(0, currentPage - 2) + i;
            if (page >= totalPages) return null;
            return (
              <button 
                key={page}
                className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page + 1}
              </button>
            );
          })}
        </div>
        <button 
          className={styles.pageBtn}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          <span>다음</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {modalOpen && modalData && (
        <div className={styles.modal} onClick={closeInventoryModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalData.type === 'increase' ? '재고 입고' : '재고 출고'}</h2>
              <button className={styles.modalClose} onClick={closeInventoryModal}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.productInfo}>
                <strong>{modalData.productName}</strong>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {modalData.type === 'increase' ? '입고' : '출고'} 수량
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className={styles.input}
                  placeholder="수량을 입력하세요"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeInventoryModal}>
                취소
              </button>
              <button className={styles.submitBtn} onClick={handleInventorySubmit}>
                {modalData.type === 'increase' ? '입고' : '출고'} 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}