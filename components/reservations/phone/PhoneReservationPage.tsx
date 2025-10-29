'use client';

import React, { useState } from 'react';
import styles from './PhoneReservationPage.module.css';

interface ReservationForm {
  customerName: string;
  phone: string;
  email: string;
  programId: string;
  date: string;
  time: string;
  participants: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  memo: string;
}

export default function PhoneReservationPage() {
  const [formData, setFormData] = useState<ReservationForm>({
    customerName: '',
    phone: '',
    email: '',
    programId: '',
    date: '',
    time: '',
    participants: 1,
    totalAmount: 0,
    paymentMethod: 'unpaid',
    paymentStatus: 'unpaid',
    memo: ''
  });

  const [programs] = useState([
    { id: 'prog-001', name: '전통주 빚기 체험', price: 30000, duration: '2시간' },
    { id: 'prog-002', name: '막걸리 테이스팅', price: 25000, duration: '1.5시간' },
    { id: 'prog-003', name: '양조장 투어', price: 15000, duration: '1시간' },
    { id: 'prog-004', name: '전통주 칵테일 만들기', price: 35000, duration: '2시간' }
  ]);

  const [availableTimes] = useState([
    '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ]);

  const handleInputChange = (field: keyof ReservationForm, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // 프로그램이 변경되면 금액 자동 계산
      if (field === 'programId' || field === 'participants') {
        const selectedProgram = programs.find(p => p.id === newData.programId);
        if (selectedProgram) {
          newData.totalAmount = selectedProgram.price * newData.participants;
        }
      }

      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.customerName.trim()) {
      alert('예약자 이름을 입력해주세요.');
      return;
    }
    if (!formData.phone.trim()) {
      alert('연락처를 입력해주세요.');
      return;
    }
    if (!formData.programId) {
      alert('체험 프로그램을 선택해주세요.');
      return;
    }
    if (!formData.date) {
      alert('체험 날짜를 선택해주세요.');
      return;
    }
    if (!formData.time) {
      alert('체험 시간을 선택해주세요.');
      return;
    }

    console.log('전화 예약 데이터:', formData);
    alert('예약이 등록되었습니다!');
    
    // 폼 초기화
    setFormData({
      customerName: '',
      phone: '',
      email: '',
      programId: '',
      date: '',
      time: '',
      participants: 1,
      totalAmount: 0,
      paymentMethod: 'unpaid',
      paymentStatus: 'unpaid',
      memo: ''
    });
  };

  const handleReset = () => {
    if (window.confirm('입력한 내용을 모두 초기화하시겠습니까?')) {
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        programId: '',
        date: '',
        time: '',
        participants: 1,
        totalAmount: 0,
        paymentMethod: 'unpaid',
        paymentStatus: 'unpaid',
        memo: ''
      });
    }
  };

  const selectedProgram = programs.find(p => p.id === formData.programId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>전화 예약 입력</h1>
        <p className={styles.description}>
          전화로 접수된 예약을 시스템에 등록합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 예약자 정보 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>예약자 정보</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                예약자명 <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="홍길동"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                연락처 <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="010-1234-5678"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>이메일 (선택)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@example.com"
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* 체험 프로그램 정보 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>체험 프로그램</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                프로그램 선택 <span className={styles.required}>*</span>
              </label>
              <select
                value={formData.programId}
                onChange={(e) => handleInputChange('programId', e.target.value)}
                className={styles.select}
              >
                <option value="">프로그램을 선택하세요</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name} - {program.price.toLocaleString()}원 ({program.duration})
                  </option>
                ))}
              </select>
            </div>

            {selectedProgram && (
              <div className={styles.programInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>소요시간:</span>
                  <span className={styles.infoValue}>{selectedProgram.duration}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>1인 가격:</span>
                  <span className={styles.infoValue}>
                    {selectedProgram.price.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 예약 일시 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>예약 일시</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                체험 날짜 <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                체험 시간 <span className={styles.required}>*</span>
              </label>
              <select
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={styles.select}
              >
                <option value="">시간을 선택하세요</option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                참가 인원 <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={formData.participants}
                onChange={(e) => handleInputChange('participants', parseInt(e.target.value) || 1)}
                min="1"
                max="20"
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>결제 정보</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>총 결제 금액</label>
              <div className={styles.amountDisplay}>
                {formData.totalAmount.toLocaleString()}원
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>결제 상태</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                className={styles.select}
              >
                <option value="unpaid">미결제</option>
                <option value="partial">부분결제</option>
                <option value="paid">결제완료</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>결제 방법</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className={styles.select}
              >
                <option value="unpaid">결제 예정</option>
                <option value="card">카드</option>
                <option value="cash">현금</option>
                <option value="transfer">계좌이체</option>
              </select>
            </div>
          </div>
        </div>

        {/* 추가 메모 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>추가 메모</h2>
          <div className={styles.formGroup}>
            <textarea
              value={formData.memo}
              onChange={(e) => handleInputChange('memo', e.target.value)}
              placeholder="예약과 관련된 특이사항을 입력하세요 (예: 주차 필요, 휠체어 사용, 알레르기 등)"
              rows={4}
              className={styles.textarea}
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleReset}
            className={styles.resetButton}
          >
            초기화
          </button>
          <button
            type="submit"
            className={styles.submitButton}
          >
            예약 등록
          </button>
        </div>
      </form>

      {/* 안내 메시지 */}
      <div className={styles.infoBox}>
        <h3 className={styles.infoBoxTitle}>💡 전화 예약 등록 안내</h3>
        <ul className={styles.infoList}>
          <li>전화로 접수된 예약을 시스템에 정확히 입력해주세요.</li>
          <li>예약자의 연락처는 예약 확인 및 안내를 위해 필수입니다.</li>
          <li>결제 상태를 정확히 선택하여 입력해주세요.</li>
          <li>특이사항이 있는 경우 메모란에 자세히 기록해주세요.</li>
        </ul>
      </div>
    </div>
  );
}