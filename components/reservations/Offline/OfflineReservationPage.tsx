'use client';

import React, { useState, useEffect } from 'react';
import styles from './OfflineReservationPage.module.css';
import { 
  fetchExperienceList, 
  createManualReservation, 
  type Experience 
} from '../../../utils/experienceApi';

interface ReservationForm {
  customerName: string;
  phone: string;
  email: string;
  experienceId: string;
  date: string;
  time: string;
  participants: number;
  totalAmount: number;
  memo: string;
}

export default function PhoneReservationPage() {
  const [formData, setFormData] = useState<ReservationForm>({
    customerName: '',
    phone: '',
    email: '',
    experienceId: '',
    date: '',
    time: '',
    participants: 1,
    totalAmount: 0,
    memo: ''
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTimes = [
    '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await fetchExperienceList();
      setExperiences(data.filter(exp => !exp.joy_is_deleted && !exp.joy_is_soldout));
    } catch (error) {
      console.error('체험 목록 로드 실패:', error);
      alert('체험 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ReservationForm, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      if (field === 'experienceId' || field === 'participants') {
        const selectedExp = experiences.find(e => String(e.joy_id) === newData.experienceId);
        if (selectedExp) {
          newData.totalAmount = selectedExp.joy_final_price * newData.participants;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      alert('예약자 이름을 입력해주세요.');
      return;
    }
    if (!formData.phone.trim()) {
      alert('연락처를 입력해주세요.');
      return;
    }
    if (!formData.experienceId) {
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

    try {
      setIsSubmitting(true);

      const result = await createManualReservation({
        id: parseInt(formData.experienceId),
        count: formData.participants,
        payer_name: formData.customerName,
        payer_phone: formData.phone,
        reservation_date: formData.date,
        reservation_time: formData.time,
        total_amount: formData.totalAmount
      });

      if (result.success) {
        alert(result.message || '예약이 등록되었습니다!');
        setFormData({
          customerName: '',
          phone: '',
          email: '',
          experienceId: '',
          date: '',
          time: '',
          participants: 1,
          totalAmount: 0,
          memo: ''
        });
      } else {
        alert(result.error || '예약 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 등록 오류:', error);
      alert('예약 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('입력한 내용을 모두 초기화하시겠습니까?')) {
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        experienceId: '',
        date: '',
        time: '',
        participants: 1,
        totalAmount: 0,
        memo: ''
      });
    }
  };

  const selectedExperience = experiences.find(e => String(e.joy_id) === formData.experienceId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>수기 예약 입력</h1>
        <p className={styles.description}>
          전화나 현장에서 접수된 예약을 시스템에 등록합니다.
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
                value={formData.experienceId}
                onChange={(e) => handleInputChange('experienceId', e.target.value)}
                className={styles.select}
                disabled={loading}
              >
                <option value="">프로그램을 선택하세요</option>
                {experiences.map(exp => (
                  <option key={exp.joy_id} value={exp.joy_id}>
                    {exp.joy_name} - {exp.joy_final_price.toLocaleString()}원 ({exp.joy_time_unit}분)
                  </option>
                ))}
              </select>
            </div>

            {selectedExperience && (
              <div className={styles.programInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>소요시간:</span>
                  <span className={styles.infoValue}>{selectedExperience.joy_time_unit}분</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>1인 가격:</span>
                  <span className={styles.infoValue}>
                    {selectedExperience.joy_final_price.toLocaleString()}원
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>최대 인원:</span>
                  <span className={styles.infoValue}>{selectedExperience.joy_max_count}명</span>
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
                max={selectedExperience?.joy_max_count || 20}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>예상 금액</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>총 예상 금액</label>
              <div className={styles.amountDisplay}>
                {formData.totalAmount.toLocaleString()}원
              </div>
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
            disabled={isSubmitting}
          >
            초기화
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? '등록 중...' : '예약 등록'}
          </button>
        </div>
      </form>

      {/* 안내 메시지 */}
      <div className={styles.infoBox}>
        <h3 className={styles.infoBoxTitle}>💡 수기 예약 등록 안내</h3>
        <ul className={styles.infoList}>
          <li>전화나 현장에서 접수된 예약을 시스템에 등록합니다.</li>
          <li>예약자의 연락처는 예약 확인 및 안내를 위해 필수입니다.</li>
          <li>결제는 현장에서 진행되며, 결제 상태는 별도로 관리됩니다.</li>
          <li>특이사항이 있는 경우 메모란에 자세히 기록해주세요.</li>
        </ul>
      </div>
    </div>
  );
}