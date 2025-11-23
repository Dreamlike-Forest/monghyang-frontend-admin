'use client';

import React, { useState } from 'react';
import styles from './ProductRegisterPage.module.css';
import { registerProduct, ProductFormData } from '../../../utils/productApi';

export default function ProductRegisterPage() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    alcohol: '',
    volume: '',
    origin_price: '',
    inventory: '',
    is_online_sell: true,
    description: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      alert('이미지는 최대 5개까지 등록 가능합니다.');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.alcohol || !formData.volume || !formData.origin_price || !formData.inventory) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await registerProduct(formData, images);

      if (result.success) {
        alert(result.message || '상품이 등록되었습니다.');
        
        setFormData({
          name: '',
          alcohol: '',
          volume: '',
          origin_price: '',
          inventory: '',
          is_online_sell: true,
          description: ''
        });
        setImages([]);
        setPreviewUrls([]);
      } else {
        alert(result.error || '상품 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error);
      alert('상품 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>제품 등록</h1>
        <p className={styles.subtitle}>새로운 전통주 제품을 등록합니다</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                제품명 <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 막걸리 프리미엄"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                알코올 도수 <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="alcohol"
                value={formData.alcohol}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 6"
                step="0.1"
                min="0"
                max="100"
                required
              />
              <span className={styles.unit}>%</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                용량 <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="volume"
                value={formData.volume}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 750"
                min="1"
                required
              />
              <span className={styles.unit}>ml</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                판매가격 <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="origin_price"
                value={formData.origin_price}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 15000"
                min="0"
                required
              />
              <span className={styles.unit}>원</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                초기 재고 수량 <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="inventory"
                value={formData.inventory}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 100"
                min="0"
                required
              />
              <span className={styles.unit}>개</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="is_online_sell"
                  checked={formData.is_online_sell}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span>온라인 판매 허용</span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>상세 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>제품 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="제품의 특징과 맛, 향 등을 자세히 설명해주세요"
              rows={5}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>제품 이미지</h2>
          <p className={styles.imageNote}>최대 5개까지 등록 가능합니다 (첫 번째 이미지가 대표 이미지입니다)</p>
          
          <div className={styles.imageUploadArea}>
            {previewUrls.map((url, index) => (
              <div key={index} className={styles.imagePreview}>
                <img src={url} alt={`미리보기 ${index + 1}`} />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => removeImage(index)}
                >
                  ✕
                </button>
                {index === 0 && <span className={styles.mainBadge}>대표</span>}
              </div>
            ))}
            
            {images.length < 5 && (
              <label className={styles.imageUploadBtn}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <div className={styles.uploadIcon}>+</div>
                <div className={styles.uploadText}>이미지 추가</div>
              </label>
            )}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="button" 
            className={styles.cancelBtn}
            onClick={() => window.history.back()}
          >
            취소
          </button>
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
}