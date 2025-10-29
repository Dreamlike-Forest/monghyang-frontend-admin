'use client';

import React, { useState } from 'react';
import styles from './ExperienceRegisterPage.module.css';

interface ProductData {
  name: string;
  place: string;
  detail: string;
  origin_price: string;
  discount_rate: string;
  final_price: string;
  sales_volume: string;
  time_unit: string;
  is_soldout: boolean;
  volume: string;
  image_key: string;
}

export default function ProductRegisterPage() {
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    place: '',
    detail: '',
    origin_price: '',
    discount_rate: '0',
    final_price: '',
    sales_volume: '',
    time_unit: '1',
    is_soldout: false,
    volume: '',
    image_key: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // 가격 자동 계산
      if (name === 'origin_price' || name === 'discount_rate') {
        const originPrice = parseFloat(name === 'origin_price' ? value : updated.origin_price) || 0;
        const discountRate = parseFloat(name === 'discount_rate' ? value : updated.discount_rate) || 0;
        updated.final_price = String(Math.round(originPrice * (1 - discountRate / 100)));
      }

      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert('체험 이미지를 업로드해주세요.');
      return;
    }

    try {
      // API 호출 로직 (실제 구현 시 추가)
      console.log('체험 상품 정보:', formData);
      console.log('이미지 파일:', imageFile);
      
      alert('체험 상품이 등록되었습니다.');
      
      // 폼 초기화
      setFormData({
        name: '',
        place: '',
        detail: '',
        origin_price: '',
        discount_rate: '0',
        final_price: '',
        sales_volume: '',
        time_unit: '1',
        is_soldout: false,
        volume: '',
        image_key: ''
      });
      setImageFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('등록 실패:', error);
      alert('등록에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>체험 상품 등록</h1>
        <p className={styles.pageDescription}>새로운 체험 프로그램을 등록합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 기본 정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>체험 이름 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="예: 전통주 빚기 체험"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>체험 장소 *</label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="예: 양조장 1층 체험실"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>체험 상세 설명 *</label>
            <textarea
              name="detail"
              value={formData.detail}
              onChange={handleInputChange}
              className={styles.textarea}
              rows={6}
              placeholder="체험의 세부 내용, 진행 방식, 포함 사항 등을 자세히 작성해주세요."
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>체험 소요 시간(단위) *</label>
              <select
                name="time_unit"
                value={formData.time_unit}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="1">1시간</option>
                <option value="2">2시간</option>
                <option value="3">3시간</option>
                <option value="4">4시간</option>
                <option value="5">5시간</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>체험 이미지 용량 (MB)</label>
              <input
                type="number"
                name="volume"
                value={formData.volume}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 11"
              />
            </div>
          </div>
        </section>

        {/* 가격 정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>가격 정보</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>정가 *</label>
              <input
                type="number"
                name="origin_price"
                value={formData.origin_price}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="원"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>할인율 (%)</label>
              <input
                type="number"
                name="discount_rate"
                value={formData.discount_rate}
                onChange={handleInputChange}
                className={styles.input}
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>최종 가격 *</label>
            <input
              type="number"
              name="final_price"
              value={formData.final_price}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="자동 계산됨"
              required
              readOnly
            />
            <span className={styles.hint}>할인율 적용 시 자동으로 계산됩니다.</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>판매량</label>
            <input
              type="number"
              name="sales_volume"
              value={formData.sales_volume}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="0"
            />
          </div>
        </section>

        {/* 이미지 업로드 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>체험 이미지 *</h2>
          
          <div className={styles.imageUploadArea}>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
              required
            />
            <label htmlFor="imageUpload" className={styles.uploadButton}>
              이미지 선택
            </label>
            {imageFile && <span className={styles.fileName}>{imageFile.name}</span>}
          </div>

          {previewUrl && (
            <div className={styles.imagePreview}>
              <img src={previewUrl} alt="체험 이미지 미리보기" />
            </div>
          )}
        </section>

        {/* 판매 상태 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>판매 상태</h2>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="is_soldout"
              checked={formData.is_soldout}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span>품절 상태로 등록</span>
          </label>
        </section>

        {/* 등록 버튼 */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => window.history.back()}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
}