'use client';

import React, { useState, useEffect } from 'react';
import styles from './ExperienceListPage.module.css';

interface Product {
  id: string;
  brewery_id: string;
  name: string;
  place: string;
  detail: string;
  origin_price: number;
  discount_rate: number;
  final_price: number;
  sales_volume: number;
  time_unit: number;
  is_soldout: boolean;
  is_deleted: boolean;
  image_key: string;
  volume: number;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'soldout'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'sales'>('name');

  // 샘플 데이터 (실제로는 API에서 가져옴)
  useEffect(() => {
    const sampleData: Product[] = [
      {
        id: '1',
        brewery_id: '1',
        name: '전통주 빚기 체험',
        place: '양조장 1층 체험실',
        detail: '직접 전통주를 빚어보는 체험 프로그램입니다.',
        origin_price: 50000,
        discount_rate: 10,
        final_price: 45000,
        sales_volume: 120,
        time_unit: 2,
        is_soldout: false,
        is_deleted: false,
        image_key: 'image1.jpg',
        volume: 11
      },
      {
        id: '2',
        brewery_id: '1',
        name: '막걸리 시음 체험',
        place: '양조장 2층 시음실',
        detail: '다양한 막걸리를 시음하며 맛의 차이를 체험합니다.',
        origin_price: 30000,
        discount_rate: 0,
        final_price: 30000,
        sales_volume: 85,
        time_unit: 1,
        is_soldout: true,
        is_deleted: false,
        image_key: 'image2.jpg',
        volume: 8
      },
      {
        id: '3',
        brewery_id: '1',
        name: '누룩 만들기 체험',
        place: '양조장 야외 공간',
        detail: '전통 누룩을 직접 만들어보는 프로그램입니다.',
        origin_price: 40000,
        discount_rate: 15,
        final_price: 34000,
        sales_volume: 65,
        time_unit: 3,
        is_soldout: false,
        is_deleted: false,
        image_key: 'image3.jpg',
        volume: 10
      }
    ];
    
    setProducts(sampleData);
    setFilteredProducts(sampleData);
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = [...products];

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.place.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터링
    if (filterStatus === 'available') {
      filtered = filtered.filter(product => !product.is_soldout);
    } else if (filterStatus === 'soldout') {
      filtered = filtered.filter(product => product.is_soldout);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.final_price - b.final_price;
        case 'sales':
          return b.sales_volume - a.sales_volume;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterStatus, sortBy]);

  const handleToggleSoldout = (id: string) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id
          ? { ...product, is_soldout: !product.is_soldout }
          : product
      )
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setProducts(prev =>
        prev.map(product =>
          product.id === id
            ? { ...product, is_deleted: true }
            : product
        ).filter(product => !product.is_deleted)
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>체험 상품 목록</h1>
          <p className={styles.pageDescription}>등록된 체험 프로그램을 관리합니다.</p>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className={styles.controlBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="체험명, 장소 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className={styles.select}
          >
            <option value="all">전체 상태</option>
            <option value="available">판매 중</option>
            <option value="soldout">품절</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.select}
          >
            <option value="name">이름순</option>
            <option value="price">가격순</option>
            <option value="sales">판매량순</option>
          </select>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>전체</span>
          <span className={styles.statValue}>{products.length}개</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>판매중</span>
          <span className={styles.statValue}>
            {products.filter(p => !p.is_soldout).length}개
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>품절</span>
          <span className={styles.statValue}>
            {products.filter(p => p.is_soldout).length}개
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>총 판매량</span>
          <span className={styles.statValue}>
            {products.reduce((sum, p) => sum + p.sales_volume, 0)}건
          </span>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className={styles.productGrid}>
        {filteredProducts.map(product => (
          <div key={product.id} className={styles.productCard}>
            {product.is_soldout && (
              <div className={styles.soldoutBadge}>품절</div>
            )}
            
            <div className={styles.productImage}>
              <div className={styles.imagePlaceholder}>
                📸
              </div>
            </div>

            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPlace}>📍 {product.place}</p>
              <p className={styles.productDetail}>{product.detail}</p>

              <div className={styles.productMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>소요시간</span>
                  <span className={styles.metaValue}>{product.time_unit}시간</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>판매량</span>
                  <span className={styles.metaValue}>{product.sales_volume}건</span>
                </div>
              </div>

              <div className={styles.priceSection}>
                {product.discount_rate > 0 && (
                  <>
                    <span className={styles.discountRate}>{product.discount_rate}%</span>
                    <span className={styles.originPrice}>
                      {product.origin_price.toLocaleString()}원
                    </span>
                  </>
                )}
                <span className={styles.finalPrice}>
                  {product.final_price.toLocaleString()}원
                </span>
              </div>

              <div className={styles.actions}>
                <button
                  onClick={() => handleToggleSoldout(product.id)}
                  className={product.is_soldout ? styles.actionButtonPrimary : styles.actionButton}
                >
                  {product.is_soldout ? '판매 재개' : '품절 처리'}
                </button>
                <button className={styles.actionButton}>
                  수정
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className={styles.actionButtonDanger}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className={styles.emptyState}>
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}