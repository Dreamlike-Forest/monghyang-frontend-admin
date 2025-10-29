'use client';

import React, { useState, useEffect } from 'react';
import styles from './BreweryPage.module.css';

interface UserData {
  user: {
    id: string;
    user_id: string;
    email: string;
    name: string;
    phone: string;
    isBreweryRegistered: boolean;
    createdAt: string;
  };
  brewery: BreweryData | null;
}

interface BreweryData {
  id?: string;
  user_id: string;
  region_type_id?: string;
  brewery_name: string;
  brewery_address: string;
  brewery_address_detail: string;
  registered_at: string;
  business_registration_number: string;
  brewery_depositor: string;
  brewery_account_number: string;
  brewery_bank_name: string;
  introduction: string;
  brewery_website: string;
  min_joy_price: string;
  joy_count: string;
  start_time: string;
  end_time: string;
  is_regular_visit: boolean;
  is_visiting_brewery: boolean;
  is_agreed_brewery: boolean;
  is_deleted: boolean;
  images: string[];
}

export default function BreweryPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isFirstRegistration, setIsFirstRegistration] = useState(false);
  
  const [formData, setFormData] = useState<BreweryData>({
    user_id: '',
    brewery_name: '',
    brewery_address: '',
    brewery_address_detail: '',
    registered_at: new Date().toISOString(),
    business_registration_number: '',
    brewery_depositor: '',
    brewery_account_number: '',
    brewery_bank_name: '',
    introduction: '',
    brewery_website: '',
    min_joy_price: '',
    joy_count: '',
    start_time: '09:00',
    end_time: '18:00',
    is_regular_visit: false,
    is_visiting_brewery: false,
    is_agreed_brewery: false,
    is_deleted: false,
    images: []
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 사용자 데이터 불러오기
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // 실제로는 API 호출, 지금은 로컬 데이터 사용
        const response = await fetch('/data/userData.json');
        const data: UserData = await response.json();
        
        setUserData(data);
        
        // 양조장 정보가 없으면 첫 등록 모드
        if (!data.brewery) {
          setIsFirstRegistration(true);
          setFormData(prev => ({
            ...prev,
            user_id: data.user.user_id
          }));
        } else {
          // 기존 양조장 정보로 폼 채우기
          setIsFirstRegistration(false);
          setFormData(data.brewery);
          setPreviewUrls(data.brewery.images || []);
        }
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        // 에러 시 첫 등록 모드
        setIsFirstRegistration(true);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = imageFiles.length + newFiles.length;

    if (totalImages > 5) {
      alert('이미지는 최대 5개까지 업로드 가능합니다.');
      return;
    }

    setImageFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // API 호출 로직 (실제 구현 시 추가)
      console.log('양조장 정보:', formData);
      console.log('업로드 이미지:', imageFiles);
      
      // 임시: localStorage에 저장
      const updatedUserData: UserData = {
        user: userData!.user,
        brewery: {
          ...formData,
          images: previewUrls
        }
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      alert(isFirstRegistration 
        ? '양조장 정보가 등록되었습니다! 이제 모든 기능을 사용하실 수 있습니다.' 
        : '양조장 정보가 수정되었습니다.');
      
      setIsFirstRegistration(false);
      
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 첫 등록 시 안내 메시지
  if (isFirstRegistration && userData) {
    return (
      <div className={styles.container}>
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeIcon}>🍶</div>
          <h1 className={styles.welcomeTitle}>환영합니다, {userData.user.name}님!</h1>
          <p className={styles.welcomeDescription}>
            양조장 정보를 등록하시면 모든 관리 기능을 사용하실 수 있습니다.
            <br />
            회원가입 시 입력하신 정보를 바탕으로 양조장 정보를 등록해주세요.
          </p>
          <div className={styles.userInfoBox}>
            <div className={styles.userInfoItem}>
              <span className={styles.label}>이메일:</span>
              <span className={styles.value}>{userData.user.email}</span>
            </div>
            <div className={styles.userInfoItem}>
              <span className={styles.label}>연락처:</span>
              <span className={styles.value}>{userData.user.phone}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {renderFormContent()}
        </form>
      </div>
    );
  }

  function renderFormContent() {
    return (
      <>
        {/* 기본 정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>양조장명 *</label>
            <input
              type="text"
              name="brewery_name"
              value={formData.brewery_name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="양조장 이름을 입력하세요"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>사업자등록번호 *</label>
            <input
              type="text"
              name="business_registration_number"
              value={formData.business_registration_number}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="000-00-00000"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>주소 *</label>
              <input
                type="text"
                name="brewery_address"
                value={formData.brewery_address}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="기본 주소"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>상세 주소</label>
            <input
              type="text"
              name="brewery_address_detail"
              value={formData.brewery_address_detail}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="상세 주소를 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>소개</label>
            <textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleInputChange}
              className={styles.textarea}
              rows={5}
              placeholder="양조장 소개 및 특징을 입력해주세요."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>웹사이트</label>
            <input
              type="url"
              name="brewery_website"
              value={formData.brewery_website}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="https://"
            />
          </div>
        </section>

        {/* 계좌 정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>계좌 정보</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>은행명 *</label>
              <input
                type="text"
                name="brewery_bank_name"
                value={formData.brewery_bank_name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 국민은행"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>예금주 *</label>
              <input
                type="text"
                name="brewery_depositor"
                value={formData.brewery_depositor}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예금주명"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>계좌번호 *</label>
            <input
              type="text"
              name="brewery_account_number"
              value={formData.brewery_account_number}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="계좌번호 (- 없이 입력)"
              required
            />
          </div>
        </section>

        {/* 운영 설정 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>운영 설정</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>운영 시작 시간 *</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>운영 종료 시간 *</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>최소 조이 가격 (원)</label>
              <input
                type="number"
                name="min_joy_price"
                value={formData.min_joy_price}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>체험 개수</label>
              <input
                type="number"
                name="joy_count"
                value={formData.joy_count}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="0"
              />
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_regular_visit"
                checked={formData.is_regular_visit}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>정규 방문 가능</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_visiting_brewery"
                checked={formData.is_visiting_brewery}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>찾아가는 양조장 여부</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_agreed_brewery"
                checked={formData.is_agreed_brewery}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>약관 동의 완료</span>
            </label>
          </div>
        </section>

        {/* 이미지 관리 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>양조장 이미지 (최대 5개)</h2>
          
          <div className={styles.imageUploadArea}>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className={styles.fileInput}
              disabled={imageFiles.length >= 5}
            />
            <label htmlFor="imageUpload" className={styles.uploadButton}>
              {imageFiles.length >= 5 ? '최대 개수 도달' : '이미지 선택'}
            </label>
            <span className={styles.imageCount}>{previewUrls.length} / 5</span>
          </div>

          {previewUrls.length > 0 && (
            <div className={styles.imagePreviewGrid}>
              {previewUrls.map((url, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={url} alt={`미리보기 ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className={styles.removeButton}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 저장 버튼 */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : (isFirstRegistration ? '등록하기' : '수정하기')}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          {isFirstRegistration ? '양조장 정보 등록' : '양조장 정보 관리'}
        </h1>
        <p className={styles.pageDescription}>
          {isFirstRegistration 
            ? '양조장의 기본 정보를 등록해주세요.' 
            : '양조장의 기본 정보와 운영 설정을 관리합니다.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {renderFormContent()}
      </form>
    </div>
  );
}