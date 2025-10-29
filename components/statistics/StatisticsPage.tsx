'use client';

import React, { useState } from 'react';
import styles from './StatisticsPage.module.css';

interface RevenueData {
  month: string;
  experience: number;
  product: number;
}

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  change: number;
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState('2025');

  // 매출 데이터 (체험 + 전통주)
  const revenueData: RevenueData[] = [
    { month: '1월', experience: 3200000, product: 580000 },
    { month: '2월', experience: 4100000, product: 720000 },
    { month: '3월', experience: 5300000, product: 950000 },
    { month: '4월', experience: 4800000, product: 880000 },
    { month: '5월', experience: 6200000, product: 1200000 },
    { month: '6월', experience: 7500000, product: 1450000 },
  ];

  // 인기 제품 TOP 5
  const topProducts: TopProduct[] = [
    { id: 1, name: '프리미엄 막걸리', sales: 145, revenue: 2175000, change: 15 },
    { id: 2, name: '청명 약주', sales: 89, revenue: 3115000, change: 8 },
    { id: 3, name: '전통 소주', sales: 76, revenue: 2128000, change: -3 },
    { id: 4, name: '과일 리큐르', sales: 54, revenue: 1350000, change: 22 },
    { id: 5, name: '탁주 세트', sales: 48, revenue: 960000, change: 5 },
  ];

  // 예약 통계
  const reservationStats = {
    total: 328,
    completed: 312,
    cancelled: 16,
    noShow: 4,
    avgGroupSize: 3.2,
    popularTime: '14:00-16:00',
  };

  // 방문자 통계
  const visitorStats = {
    total: 1247,
    new: 823,
    returning: 424,
    mz: 52,
    family: 36,
    enthusiast: 12,
  };

  const totalRevenue = revenueData.reduce((sum, data) => sum + data.experience + data.product, 0);
  const experienceRevenue = revenueData.reduce((sum, data) => sum + data.experience, 0);
  const productRevenue = revenueData.reduce((sum, data) => sum + data.product, 0);

  const maxRevenue = Math.max(...revenueData.map(d => d.experience + d.product));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>통계</h1>
          <p className={styles.subtitle}>양조장의 매출 및 운영 현황을 분석합니다</p>
        </div>
        <div className={styles.headerControls}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={styles.yearSelect}
          >
            <option value="2025">2025년</option>
            <option value="2024">2024년</option>
            <option value="2023">2023년</option>
          </select>
          <div className={styles.periodTabs}>
            <button
              className={`${styles.periodTab} ${period === 'week' ? styles.active : ''}`}
              onClick={() => setPeriod('week')}
            >
              주간
            </button>
            <button
              className={`${styles.periodTab} ${period === 'month' ? styles.active : ''}`}
              onClick={() => setPeriod('month')}
            >
              월간
            </button>
            <button
              className={`${styles.periodTab} ${period === 'year' ? styles.active : ''}`}
              onClick={() => setPeriod('year')}
            >
              연간
            </button>
          </div>
        </div>
      </div>

      {/* 매출 개요 */}
      <div className={styles.overviewCards}>
        <div className={`${styles.overviewCard} ${styles.primary}`}>
          <div className={styles.cardIcon}>💰</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>총 매출</div>
            <div className={styles.cardValue}>{totalRevenue.toLocaleString()}원</div>
            <div className={styles.cardChange}>
              <span className={styles.positive}>↑ 12.5%</span> 전월 대비
            </div>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>🎫</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>체험 매출</div>
            <div className={styles.cardValue}>{experienceRevenue.toLocaleString()}원</div>
            <div className={styles.cardPercentage}>
              전체의 {((experienceRevenue / totalRevenue) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>🍶</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>전통주 매출</div>
            <div className={styles.cardValue}>{productRevenue.toLocaleString()}원</div>
            <div className={styles.cardPercentage}>
              전체의 {((productRevenue / totalRevenue) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>총 방문자</div>
            <div className={styles.cardValue}>{visitorStats.total.toLocaleString()}명</div>
            <div className={styles.cardChange}>
              <span className={styles.positive}>↑ 8.3%</span> 전월 대비
            </div>
          </div>
        </div>
      </div>

      {/* 매출 추이 그래프 */}
      <div className={styles.chartSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>월별 매출 추이</h2>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.experience}`}></span>
              체험 프로그램
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.product}`}></span>
              전통주 판매
            </div>
          </div>
        </div>
        
        <div className={styles.chart}>
          <div className={styles.chartYAxis}>
            <span>1,000만원</span>
            <span>750만원</span>
            <span>500만원</span>
            <span>250만원</span>
            <span>0원</span>
          </div>
          <div className={styles.chartContent}>
            {revenueData.map((data, index) => {
              const total = data.experience + data.product;
              const heightPercent = (total / maxRevenue) * 100;
              const experiencePercent = (data.experience / total) * 100;

              return (
                <div key={index} className={styles.chartBar}>
                  <div className={styles.barWrapper} style={{ height: `${heightPercent}%` }}>
                    <div
                      className={styles.barExperience}
                      style={{ height: `${experiencePercent}%` }}
                      title={`체험: ${data.experience.toLocaleString()}원`}
                    />
                    <div
                      className={styles.barProduct}
                      style={{ height: `${100 - experiencePercent}%` }}
                      title={`전통주: ${data.product.toLocaleString()}원`}
                    />
                  </div>
                  <div className={styles.barLabel}>{data.month}</div>
                  <div className={styles.barValue}>{(total / 10000).toFixed(0)}만</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.twoColumnGrid}>
        {/* 인기 제품 TOP 5 */}
        <div className={styles.rankingSection}>
          <h2 className={styles.sectionTitle}>인기 제품 TOP 5</h2>
          <div className={styles.rankingList}>
            {topProducts.map((product, index) => (
              <div key={product.id} className={styles.rankingItem}>
                <div className={styles.rank}>
                  <span className={index < 3 ? styles.topRank : ''}>{index + 1}</span>
                </div>
                <div className={styles.rankingInfo}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productStats}>
                    판매 {product.sales}개 · {product.revenue.toLocaleString()}원
                  </div>
                </div>
                <div className={styles.changeIndicator}>
                  {product.change > 0 ? (
                    <span className={styles.positive}>↑ {product.change}%</span>
                  ) : product.change < 0 ? (
                    <span className={styles.negative}>↓ {Math.abs(product.change)}%</span>
                  ) : (
                    <span className={styles.neutral}>-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 예약 통계 */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>예약 통계</h2>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>총 예약</div>
              <div className={styles.statValue}>{reservationStats.total}건</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>완료</div>
              <div className={styles.statValue}>
                {reservationStats.completed}건
                <span className={styles.statPercent}>
                  ({((reservationStats.completed / reservationStats.total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>취소</div>
              <div className={styles.statValue}>
                {reservationStats.cancelled}건
                <span className={styles.statPercent}>
                  ({((reservationStats.cancelled / reservationStats.total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>노쇼</div>
              <div className={styles.statValue}>
                {reservationStats.noShow}건
                <span className={styles.statPercent}>
                  ({((reservationStats.noShow / reservationStats.total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>평균 인원</div>
              <div className={styles.statValue}>{reservationStats.avgGroupSize}명</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>인기 시간대</div>
              <div className={styles.statValue}>{reservationStats.popularTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 방문자 분석 */}
      <div className={styles.visitorSection}>
        <h2 className={styles.sectionTitle}>방문자 분석</h2>
        <div className={styles.visitorGrid}>
          <div className={styles.visitorCard}>
            <div className={styles.visitorLabel}>신규 방문자</div>
            <div className={styles.visitorValue}>{visitorStats.new}명</div>
            <div className={styles.visitorBar}>
              <div
                className={styles.visitorBarFill}
                style={{ width: `${(visitorStats.new / visitorStats.total) * 100}%` }}
              />
            </div>
            <div className={styles.visitorPercent}>
              {((visitorStats.new / visitorStats.total) * 100).toFixed(1)}%
            </div>
          </div>

          <div className={styles.visitorCard}>
            <div className={styles.visitorLabel}>재방문자</div>
            <div className={styles.visitorValue}>{visitorStats.returning}명</div>
            <div className={styles.visitorBar}>
              <div
                className={`${styles.visitorBarFill} ${styles.returning}`}
                style={{ width: `${(visitorStats.returning / visitorStats.total) * 100}%` }}
              />
            </div>
            <div className={styles.visitorPercent}>
              {((visitorStats.returning / visitorStats.total) * 100).toFixed(1)}%
            </div>
          </div>

          <div className={styles.demographicCard}>
            <div className={styles.demographicTitle}>고객 유형</div>
            <div className={styles.demographicList}>
              <div className={styles.demographicItem}>
                <span className={styles.demographicLabel}>2030 MZ세대</span>
                <span className={styles.demographicValue}>{visitorStats.mz}%</span>
              </div>
              <div className={styles.demographicItem}>
                <span className={styles.demographicLabel}>40대+ 가족층</span>
                <span className={styles.demographicValue}>{visitorStats.family}%</span>
              </div>
              <div className={styles.demographicItem}>
                <span className={styles.demographicLabel}>주류 애호가</span>
                <span className={styles.demographicValue}>{visitorStats.enthusiast}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <div className={styles.actionButtons}>
        <button className={styles.downloadBtn}>
          <span className={styles.btnIcon}>📊</span>
          엑셀 다운로드
        </button>
        <button className={styles.downloadBtn}>
          <span className={styles.btnIcon}>📄</span>
          PDF 리포트
        </button>
      </div>
    </div>
  );
}