'use client';

import React from 'react';
import { Plus, Calendar, Package, BarChart3 } from 'lucide-react';
import styles from './QuickActions.module.css';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  pageId: string;
}

interface QuickActionsProps {
  onNavigate: (page: string) => void;
}

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'new-reservation',
      label: '수기 예약',
      icon: <Plus size={20} />,
      color: '#8b5a3c',
      pageId: 'reservation-phone'
    },
    {
      id: 'view-schedule',
      label: '예약 현황',
      icon: <Calendar size={20} />,
      color: '#d97129',
      pageId: 'reservation-status'
    },
    {
      id: 'add-product',
      label: '상품 등록',
      icon: <Package size={20} />,
      color: '#6b7280',
      pageId: 'product-register'
    },
    {
      id: 'view-stats',
      label: '통계 보기',
      icon: <BarChart3 size={20} />,
      color:'#10b981',
      pageId: 'statistics'
    }
  ];

  const handleAction = (pageId: string) => {
    onNavigate(pageId);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>빠른 작업</h3>
      <div className={styles.actionsGrid}>
        {actions.map(action => (
          <button
            key={action.id}
            className={styles.actionButton}
            onClick={() => handleAction(action.pageId)}
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