'use client';

import React from 'react';
import { Plus, Calendar, Package, BarChart3 } from 'lucide-react';
import styles from './QuickActions.module.css';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      id: 'new-reservation',
      label: '예약 추가',
      icon: <Plus size={20} />,
      color: '#8b5a3c'
    },
    {
      id: 'view-schedule',
      label: '일정 확인',
      icon: <Calendar size={20} />,
      color: '#d97129'
    },
    {
      id: 'add-product',
      label: '상품 등록',
      icon: <Package size={20} />,
      color: '#6b7280'
    },
    {
      id: 'view-stats',
      label: '통계 보기',
      icon: <BarChart3 size={20} />,
      color:'#10b981'
    }
  ];

  const handleAction = (id: string) => {
    console.log(`Quick action clicked: ${id}`);
    // 실제 구현 시 각 액션에 맞는 동작 추가
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>빠른 작업</h3>
      <div className={styles.actionsGrid}>
        {actions.map(action => (
          <button
            key={action.id}
            className={styles.actionButton}
            onClick={() => handleAction(action.id)}
            style={{ borderColor: action.color }}
          >
            <div 
              className={styles.iconWrapper}
              style={{ backgroundColor: `${action.color}15` }}
            >
              <span style={{ color: action.color }}>
                {action.icon}
              </span>
            </div>
            <span className={styles.actionLabel}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}