'use client';

import React, { useState, useEffect } from 'react';
import { Package, Edit2, Trash2, Search, AlertTriangle, XCircle, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import styles from './ProductListPage.module.css';
import { 
  getProducts, 
  getProduct,
  Product,
  ProductListResponse
} from '../../../utils/productApi';

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [currentPage, filterStatus, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 현재 로그인한 사용자의 userId를 가져와야 함
      // localStorage나 세션에서 userId를 가져오는 로직 필요
      const userData = localStorage.getItem('userData');
      const userId = userData ? JSON.parse(userData).id : null;

      if (!userId) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const response = await getProducts({
        userId,
        startOffset: currentPage,
        keyword: searchTerm || undefined,
      });

      // 품절 필터링 (클라이언트 사이드)
      let filteredProducts = response.content;
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
      setError(err.response?.data?.message || '제품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`'${name}'을(를) 삭제하시겠습니까?`)) {
      try {
        const { deleteProduct } = await import('../../../utils/productApi');
        const result = await deleteProduct(id);
        if (result.success) {
          alert(result.message);
          loadProducts(); // 목록 새로고침
        } else {
          alert(result.error);
        }
      } catch (err: any) {
        console.error('삭제 실패:', err);
        alert('제품 삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = (product: Product) => {
    // 제품 수정 페이지로 이동
    // router.push(`/products/edit/${product.product_id}`);
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
                        <img src={product.image_key} alt={product.product_name} />
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
                    <span className={product.product_is_soldout ? styles.soldoutBadge : styles.activeBadge}>
                      {product.product_is_soldout ? '품절' : '판매중'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
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
    </div>
  );
}