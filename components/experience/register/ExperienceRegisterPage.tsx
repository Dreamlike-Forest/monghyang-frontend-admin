'use client';

import React, { useState } from 'react';
import styles from './ExperienceRegisterPage.module.css';
import { registerExperience, ExperienceFormData } from '../../../utils/experienceApi';

interface FormData {
  name: string;
  place: string;
  detail: string;
  origin_price: string;
  time_unit: string;
  max_count: string;
}

export default function ExperienceRegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    place: '',
    detail: '',
    origin_price: '',
    time_unit: '30',
    max_count: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('이미지 크기는 10MB 이하여야 합니다.');
      return;
    }

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

    if (!formData.origin_price || parseFloat(formData.origin_price) <= 0) {
      alert('정가를 올바르게 입력해주세요.');
      return;
    }

    if (!formData.max_count || parseInt(formData.max_count) < 1) {
      alert('최대 수용 인원을 1명 이상으로 입력해주세요.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const requestData: ExperienceFormData = {
        name: formData.name,
        place: formData.place,
        detail: formData.detail,
        origin_price: parseFloat(formData.origin_price),
        time_unit: parseInt(formData.time_unit),
        max_count: parseInt(formData.max_count)
      };

      const result = await registerExperience(requestData, imageFile);

      if (result.success) {
        alert(result.message || '체험 상품이 등록되었습니다.');
        
        setFormData({
          name: '',
          place: '',
          detail: '',
          origin_price: '',
          time_unit: '30',
          max_count: ''
        });
        setImageFile(null);
        setPreviewUrl('');
      } else {
        alert(result.error || '체험 상품 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error);
      alert('체험 상품 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>체험 상품 등록</h1>
        <p className={styles.pageDescription}>새로운 체험 프로그램을 등록합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>체험 소요 시간 (분) *</label>
            <select
              name="time_unit"
              value={formData.time_unit}
              onChange={handleInputChange}
              className={styles.select}
              required
              disabled={isSubmitting}
            >
              <option value="30">30분</option>
              <option value="60">1시간</option>
              <option value="90">1시간 30분</option>
              <option value="120">2시간</option>
              <option value="150">2시간 30분</option>
              <option value="180">3시간</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>1인당 가격 *</label>
              <input
                type="number"
                name="origin_price"
                value={formData.origin_price}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="원"
                min="0"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>최대 수용 인원 *</label>
              <input
                type="number"
                name="max_count"
                value={formData.max_count}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="명"
                min="1"
                required
                disabled={isSubmitting}
              />
              <span className={styles.hint}>동시간 최대 수용 가능한 인원 수를 입력해주세요.</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>체험 이미지 *</h2>
          <p className={styles.sectionDescription}>1개의 대표 이미지를 업로드해주세요. (최대 10MB)</p>
          
          <div className={styles.imageUploadArea}>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
              required
              disabled={isSubmitting}
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

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
}