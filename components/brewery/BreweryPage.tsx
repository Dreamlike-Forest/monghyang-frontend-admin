'use client';

import React, { useState, useEffect } from 'react';
import styles from './BreweryPage.module.css';
import { getUserInfo, updateBrewery, UserInfo, BreweryDetail, BreweryFormData } from '../../utils/breweryApi';

export default function BreweryPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BreweryFormData>({
    brewery_name: '',
    brewery_address: '',
    brewery_address_detail: '',
    business_registration_number: '',
    brewery_depositor: '',
    brewery_account_number: '',
    brewery_bank_name: '',
    introduction: '',
    brewery_website: '',
    is_regular_visit: false,
    start_time: '09:00',
    end_time: '18:00',
  });

  useEffect(() => {
    loadBreweryData();
  }, []);

  const loadBreweryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getUserInfo();
      setUserInfo(data);
      
      if (!data.brewery) {
        setError('양조장 정보가 등록되지 않았습니다.');
        return;
      }

      const brewery = data.brewery;
      setFormData({
        brewery_name: brewery.brewery_name,
        brewery_address: brewery.brewery_address,
        brewery_address_detail: brewery.brewery_address_detail,
        business_registration_number: brewery.brewery_business_registration_number,
        brewery_depositor: brewery.brewery_depositor,
        brewery_account_number: brewery.brewery_account_number,
        brewery_bank_name: brewery.brewery_bank_name,
        introduction: brewery.brewery_introduction,
        brewery_website: brewery.brewery_website,
        is_regular_visit: brewery.brewery_is_regular_visit,
        start_time: brewery.brewery_start_time,
        end_time: brewery.brewery_end_time,
      });
    } catch (error: any) {
      console.error('양조장 정보 로드 실패:', error);
      
      let errorMessage = '양조장 정보를 불러오는데 실패했습니다.';
      
      if (error.response?.status === 404) {
        errorMessage = '사용자 정보를 찾을 수 없습니다. 로그인 상태를 확인해주세요.';
      } else if (error.response?.status === 403) {
        errorMessage = '권한이 없습니다. 로그인 상태를 확인해주세요.';
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (userInfo?.brewery) {
      const brewery = userInfo.brewery;
      setFormData({
        brewery_name: brewery.brewery_name,
        brewery_address: brewery.brewery_address,
        brewery_address_detail: brewery.brewery_address_detail,
        business_registration_number: brewery.brewery_business_registration_number,
        brewery_depositor: brewery.brewery_depositor,
        brewery_account_number: brewery.brewery_account_number,
        brewery_bank_name: brewery.brewery_bank_name,
        introduction: brewery.brewery_introduction,
        brewery_website: brewery.brewery_website,
        is_regular_visit: brewery.brewery_is_regular_visit,
        start_time: brewery.brewery_start_time,
        end_time: brewery.brewery_end_time,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await updateBrewery(formData);
      
      if (result.success) {
        alert(result.message || '양조장 정보가 수정되었습니다.');
        await loadBreweryData();
        setIsEditMode(false);
      } else {
        alert(result.error || '수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>양조장 정보 관리</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>
          로딩 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>양조장 정보 관리</h1>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          backgroundColor: '#fef2f2',
          borderRadius: '12px',
          border: '1px solid #fecaca',
          margin: '20px 0'
        }}>
          <p style={{ color: '#dc2626', fontSize: '16px', marginBottom: '20px' }}>
            {error}
          </p>
          <button
            onClick={loadBreweryData}
            className={styles.submitButton}
            style={{ display: 'inline-block' }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!userInfo?.brewery) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>양조장 정보 관리</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>
          양조장 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const brewery = userInfo.brewery;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>양조장 정보 관리</h1>
        <p className={styles.pageDescription}>
          {isEditMode ? '양조장 정보를 수정할 수 있습니다.' : '등록된 양조장 정보를 확인하세요.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 기본 정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>양조장명</label>
            {isEditMode ? (
              <input
                type="text"
                name="brewery_name"
                value={formData.brewery_name}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            ) : (
              <div className={styles.value}>{brewery.brewery_name}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>사업자등록번호</label>
            {isEditMode ? (
              <input
                type="text"
                name="business_registration_number"
                value={formData.business_registration_number}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="000-00-00000"
                required
              />
            ) : (
              <div className={styles.value}>{brewery.brewery_business_registration_number}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>지역</label>
            <div className={styles.value}>{brewery.region_type_name || '-'}</div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>주소</label>
            {isEditMode ? (
              <input
                type="text"
                name="brewery_address"
                value={formData.brewery_address}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            ) : (
              <div className={styles.value}>{brewery.brewery_address}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>상세 주소</label>
            {isEditMode ? (
              <input
                type="text"
                name="brewery_address_detail"
                value={formData.brewery_address_detail}
                onChange={handleInputChange}
                className={styles.input}
              />
            ) : (
              <div className={styles.value}>{brewery.brewery_address_detail || '-'}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>소개</label>
            {isEditMode ? (
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={5}
              />
            ) : (
              <div className={styles.value} style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
                {brewery.brewery_introduction || '-'}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>웹사이트</label>
            {isEditMode ? (
              <input
                type="url"
                name="brewery_website"
                value={formData.brewery_website}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="https://"
              />
            ) : (
              <div className={styles.value}>
                {brewery.brewery_website ? (
                  <a href={brewery.brewery_website} target="_blank" rel="noopener noreferrer">
                    {brewery.brewery_website}
                  </a>
                ) : '-'}
              </div>
            )}
          </div>
        </section>

        {/* 계좌 정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>계좌 정보</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>은행명</label>
              {isEditMode ? (
                <input
                  type="text"
                  name="brewery_bank_name"
                  value={formData.brewery_bank_name}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="예: 국민은행"
                  required
                />
              ) : (
                <div className={styles.value}>{brewery.brewery_bank_name}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>예금주</label>
              {isEditMode ? (
                <input
                  type="text"
                  name="brewery_depositor"
                  value={formData.brewery_depositor}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="예금주명"
                  required
                />
              ) : (
                <div className={styles.value}>{brewery.brewery_depositor}</div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>계좌번호</label>
            {isEditMode ? (
              <input
                type="text"
                name="brewery_account_number"
                value={formData.brewery_account_number}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="계좌번호 (- 없이 입력)"
                required
              />
            ) : (
              <div className={styles.value}>{brewery.brewery_account_number}</div>
            )}
          </div>
        </section>

        {/* 운영 설정 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>운영 설정</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>운영 시작 시간</label>
              {isEditMode ? (
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              ) : (
                <div className={styles.value}>{brewery.brewery_start_time}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>운영 종료 시간</label>
              {isEditMode ? (
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              ) : (
                <div className={styles.value}>{brewery.brewery_end_time}</div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              {isEditMode ? (
                <input
                  type="checkbox"
                  name="is_regular_visit"
                  checked={formData.is_regular_visit}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
              ) : (
                <input
                  type="checkbox"
                  checked={brewery.brewery_is_regular_visit}
                  className={styles.checkbox}
                  disabled
                />
              )}
              <span>상시 방문 가능</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>찾아가는 양조장 선정 여부</label>
            <div className={styles.value}>
              {brewery.brewery_is_visiting_brewery ? '선정됨' : '미선정'}
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#6b7280' }}>
                (관리자가 지정하는 값으로 수정할 수 없습니다)
              </span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>약관 동의 여부</label>
            <div className={styles.value}>
              {brewery.brewery_is_agreed_brewery ? '동의 완료' : '미동의'}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>등록일</label>
            <div className={styles.value}>{brewery.brewery_registered_at}</div>
          </div>
        </section>

        {/* 버튼 영역 */}
        <div className={styles.formActions}>
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className={styles.submitButton}
                style={{ backgroundColor: '#6b7280', marginRight: '10px' }}
                disabled={isSaving}
              >
                취소
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : '수정 완료'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEditClick}
              className={styles.submitButton}
            >
              수정하기
            </button>
          )}
        </div>
      </form>
    </div>
  );
}