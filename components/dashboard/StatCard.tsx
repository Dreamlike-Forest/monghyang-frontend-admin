'use client';

import React from 'react';
import { Calendar, Package, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconType: 'calendar' | 'package' | 'trending';
}

export default function StatCard({ title, value, change, isPositive, iconType }: StatCardProps) {
  const getIcon = () => {
    switch (iconType) {
      case 'calendar':
        return <Calendar size={24} />;
      case 'package':
        return <Package size={24} />;
      case 'trending':
        return <TrendingUp size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <div className={styles.iconWrapper}>
          {getIcon()}
        </div>
        <div className={`${styles.changeIndicator} ${isPositive ? styles.positive : styles.negative}`}>
          {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          {change}
        </div>
      </div>
      <div className={styles.statBody}>
        <p className={styles.statTitle}>{title}</p>
        <h3 className={styles.statValue}>{value}</h3>
      </div>
    </div>
  );
}