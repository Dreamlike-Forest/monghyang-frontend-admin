'use client';

import React, { useState, useEffect } from 'react';
import styles from './ExperienceListPage.module.css';
import {
  fetchExperienceList,
  setSoldout,
  unsetSoldout,
  deleteExperience,
  Experience
} from '../../../utils/experienceApi';

export default function ExperienceListPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'soldout'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'sales'>('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchExperienceList();
      setExperiences(data);
      setFilteredExperiences(data);
    } catch (err) {
      setError('체험 목록을 불러오는데 실패했습니다.');
      console.error('체험 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...experiences];

    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.joy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.joy_place.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus === 'available') {
      filtered = filtered.filter(exp => !exp.joy_is_soldout);
    } else if (filterStatus === 'soldout') {
      filtered = filtered.filter(exp => exp.joy_is_soldout);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.joy_final_price - b.joy_final_price;
        case 'sales':
          return b.joy_sales_volume - a.joy_sales_volume;
        default:
          return a.joy_name.localeCompare(b.joy_name);
      }
    });

    setFilteredExperiences(filtered);
  }, [experiences, searchTerm, filterStatus, sortBy]);

  const handleToggleSoldout = async (joyId: number, isSoldout: boolean) => {
    try {
      const result = isSoldout 
        ? await unsetSoldout(joyId)
        : await setSoldout(joyId);

      if (result.success) {
        await loadExperiences();
        alert(result.message);
      } else {
        alert(result.error || '품절 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('품절 처리 중 오류가 발생했습니다.');
      console.error('품절 처리 오류:', err);
    }
  };

  const handleDelete = async (joyId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const result = await deleteExperience(joyId);
      if (result.success) {
        await loadExperiences();
        alert(result.message);
      } else {
        alert(result.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
      console.error('삭제 오류:', err);
    }
  };

  const getImageUrl = (imageKey: string | null) => {
    if (!imageKey) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234';
    return `${baseUrl}/api/image/${imageKey}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>체험 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error}
          <button onClick={loadExperiences} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>체험 상품 목록</h1>
          <p className={styles.pageDescription}>등록된 체험 프로그램을 관리합니다.</p>
        </div>
      </div>

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

      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>전체</span>
          <span className={styles.statValue}>{experiences.length}개</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>판매중</span>
          <span className={styles.statValue}>
            {experiences.filter(e => !e.joy_is_soldout).length}개
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>품절</span>
          <span className={styles.statValue}>
            {experiences.filter(e => e.joy_is_soldout).length}개
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>총 판매량</span>
          <span className={styles.statValue}>
            {experiences.reduce((sum, e) => sum + e.joy_sales_volume, 0)}건
          </span>
        </div>
      </div>

      <div className={styles.productGrid}>
        {filteredExperiences.map(exp => (
          <div key={exp.joy_id} className={styles.productCard}>
            {exp.joy_is_soldout && (
              <div className={styles.soldoutBadge}>품절</div>
            )}
            
            <div className={styles.productImage}>
              {exp.joy_image_key ? (
                <img 
                  src={getImageUrl(exp.joy_image_key) || ''} 
                  alt={exp.joy_name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="' + styles.imagePlaceholder + '">이미지 없음</div>';
                  }}
                />
              ) : (
                <div className={styles.imagePlaceholder}>이미지 없음</div>
              )}
            </div>

            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{exp.joy_name}</h3>
              <p className={styles.productPlace}>{exp.joy_place}</p>
              <p className={styles.productDetail}>{exp.joy_detail}</p>

              <div className={styles.productMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>소요시간</span>
                  <span className={styles.metaValue}>{exp.joy_time_unit}시간</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>최대인원</span>
                  <span className={styles.metaValue}>{exp.joy_max_count}명</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>판매량</span>
                  <span className={styles.metaValue}>{exp.joy_sales_volume}건</span>
                </div>
              </div>

              <div className={styles.priceSection}>
                {exp.joy_discount_rate > 0 && (
                  <>
                    <span className={styles.discountRate}>{exp.joy_discount_rate}%</span>
                    <span className={styles.originPrice}>
                      {exp.joy_origin_price.toLocaleString()}원
                    </span>
                  </>
                )}
                <span className={styles.finalPrice}>
                  {exp.joy_final_price.toLocaleString()}원
                </span>
              </div>

              <div className={styles.actions}>
                <button
                  onClick={() => handleToggleSoldout(exp.joy_id, exp.joy_is_soldout)}
                  className={exp.joy_is_soldout ? styles.actionButtonPrimary : styles.actionButton}
                >
                  {exp.joy_is_soldout ? '판매 재개' : '품절 처리'}
                </button>
                <button className={styles.actionButton}>
                  수정
                </button>
                <button
                  onClick={() => handleDelete(exp.joy_id)}
                  className={styles.actionButtonDanger}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExperiences.length === 0 && (
        <div className={styles.emptyState}>
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}