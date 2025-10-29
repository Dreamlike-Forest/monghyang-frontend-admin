'use client';

import React, { useState } from 'react';
import styles from './SchedulePage.module.css';

interface Schedule {
  id: string;
  date: string;
  productName: string;
  productId: string;
  timeSlot: string;
  maxCapacity: number;
  currentBookings: number;
  status: 'available' | 'full' | 'closed';
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      date: '2025-10-15',
      productName: '전통주 빚기 체험',
      productId: '1',
      timeSlot: '10:00-12:00',
      maxCapacity: 20,
      currentBookings: 15,
      status: 'available'
    },
    {
      id: '2',
      date: '2025-10-15',
      productName: '막걸리 시음 체험',
      productId: '2',
      timeSlot: '14:00-15:00',
      maxCapacity: 15,
      currentBookings: 15,
      status: 'full'
    },
    {
      id: '3',
      date: '2025-10-16',
      productName: '누룩 만들기 체험',
      productId: '3',
      timeSlot: '10:00-13:00',
      maxCapacity: 12,
      currentBookings: 8,
      status: 'available'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    productId: '',
    timeSlot: '',
    maxCapacity: 10
  });

  // 달력 생성 함수
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 빈 칸
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 현재 달의 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return schedules.filter(s => s.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(formatDate(date));
  };

  const handleAddSchedule = () => {
    if (!newSchedule.date || !newSchedule.productId || !newSchedule.timeSlot) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const schedule: Schedule = {
      id: Date.now().toString(),
      date: newSchedule.date,
      productName: '체험 프로그램',
      productId: newSchedule.productId,
      timeSlot: newSchedule.timeSlot,
      maxCapacity: newSchedule.maxCapacity,
      currentBookings: 0,
      status: 'available'
    };

    setSchedules(prev => [...prev, schedule]);
    setShowAddModal(false);
    setNewSchedule({
      date: '',
      productId: '',
      timeSlot: '',
      maxCapacity: 10
    });
  };

  const handleCloseSchedule = (id: string) => {
    if (confirm('이 일정을 마감하시겠습니까?')) {
      setSchedules(prev =>
        prev.map(s => s.id === id ? { ...s, status: 'closed' as const } : s)
      );
    }
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  const days = getDaysInMonth(currentMonth);
  const selectedSchedules = selectedDate ? schedules.filter(s => s.date === selectedDate) : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>일정 관리</h1>
          <p className={styles.pageDescription}>체험 프로그램의 일정을 관리하고 예약 현황을 확인합니다.</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          + 일정 추가
        </button>
      </div>

      {/* 통계 요약 */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>이번 달 일정</span>
          <span className={styles.statValue}>
            {schedules.filter(s => s.date.startsWith(currentMonth.toISOString().slice(0, 7))).length}개
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>예약 가능</span>
          <span className={styles.statValue}>
            {schedules.filter(s => s.status === 'available').length}개
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>예약 마감</span>
          <span className={styles.statValue}>
            {schedules.filter(s => s.status === 'full').length}개
          </span>
        </div>
      </div>

      <div className={styles.content}>
        {/* 달력 */}
        <div className={styles.calendar}>
          <div className={styles.calendarHeader}>
            <button onClick={handlePrevMonth} className={styles.navButton}>
              ◀
            </button>
            <h2 className={styles.monthTitle}>
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h2>
            <button onClick={handleNextMonth} className={styles.navButton}>
              ▶
            </button>
          </div>

          <div className={styles.weekdays}>
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className={styles.weekday}>{day}</div>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className={styles.emptyDay}></div>;
              }

              const dateStr = formatDate(day);
              const daySchedules = getSchedulesForDate(day);
              const isToday = formatDate(new Date()) === dateStr;
              const isSelected = selectedDate === dateStr;

              return (
                <div
                  key={dateStr}
                  className={`${styles.day} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className={styles.dayNumber}>{day.getDate()}</div>
                  {daySchedules.length > 0 && (
                    <div className={styles.scheduleIndicators}>
                      {daySchedules.slice(0, 3).map(schedule => (
                        <div
                          key={schedule.id}
                          className={`${styles.scheduleIndicator} ${styles[schedule.status]}`}
                          title={`${schedule.productName} ${schedule.timeSlot}`}
                        />
                      ))}
                      {daySchedules.length > 3 && (
                        <div className={styles.moreIndicator}>+{daySchedules.length - 3}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 선택된 날짜의 일정 목록 */}
        <div className={styles.scheduleList}>
          <h3 className={styles.scheduleListTitle}>
            {selectedDate 
              ? `${selectedDate} 일정` 
              : '날짜를 선택하세요'}
          </h3>

          {selectedSchedules.length > 0 ? (
            <div className={styles.scheduleItems}>
              {selectedSchedules.map(schedule => (
                <div key={schedule.id} className={styles.scheduleItem}>
                  <div className={styles.scheduleInfo}>
                    <div className={styles.scheduleHeader}>
                      <h4 className={styles.scheduleName}>{schedule.productName}</h4>
                      <span className={`${styles.statusBadge} ${styles[schedule.status]}`}>
                        {schedule.status === 'available' && '예약가능'}
                        {schedule.status === 'full' && '예약마감'}
                        {schedule.status === 'closed' && '운영종료'}
                      </span>
                    </div>

                    <div className={styles.scheduleDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>시간</span>
                        <span className={styles.detailValue}>{schedule.timeSlot}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>예약 현황</span>
                        <span className={styles.detailValue}>
                          {schedule.currentBookings} / {schedule.maxCapacity}명
                        </span>
                      </div>
                    </div>

                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ 
                          width: `${(schedule.currentBookings / schedule.maxCapacity) * 100}%`,
                          backgroundColor: schedule.status === 'full' ? '#dc2626' : '#7a3118'
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.scheduleActions}>
                    {schedule.status !== 'closed' && (
                      <button
                        onClick={() => handleCloseSchedule(schedule.id)}
                        className={styles.actionBtn}
                      >
                        마감
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className={styles.actionBtnDanger}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedDate ? (
            <div className={styles.emptySchedule}>
              <p>이 날짜에 등록된 일정이 없습니다.</p>
            </div>
          ) : (
            <div className={styles.emptySchedule}>
              <p>달력에서 날짜를 선택하면 일정을 확인할 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>새 일정 추가</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>날짜 *</label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>체험 프로그램 *</label>
                <select
                  value={newSchedule.productId}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, productId: e.target.value }))}
                  className={styles.select}
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="1">전통주 빚기 체험</option>
                  <option value="2">막걸리 시음 체험</option>
                  <option value="3">누룩 만들기 체험</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>시간대 *</label>
                <input
                  type="text"
                  value={newSchedule.timeSlot}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, timeSlot: e.target.value }))}
                  className={styles.input}
                  placeholder="예: 10:00-12:00"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>최대 인원 *</label>
                <input
                  type="number"
                  value={newSchedule.maxCapacity}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, maxCapacity: Number(e.target.value) }))}
                  className={styles.input}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowAddModal(false)}
                className={styles.cancelBtn}
              >
                취소
              </button>
              <button
                onClick={handleAddSchedule}
                className={styles.submitBtn}
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}