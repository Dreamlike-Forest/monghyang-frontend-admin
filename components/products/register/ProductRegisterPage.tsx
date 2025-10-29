'use client';

import React, { useState } from 'react';
import styles from './ProductRegisterPage.module.css';

interface ProductFormData {
  name: string;
  type: string;
  alcohol: string;
  volume: string;
  price: string;
  stock: string;
  description: string;
  ingredients: string;
  origin: string;
  manufacturer: string;
}

export default function ProductRegisterPage() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    type: '',
    alcohol: '',
    volume: '',
    price: '',
    stock: '',
    description: '',
    ingredients: '',
    origin: '',
    manufacturer: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    
    // 유효성 검사
    if (!formData.name || !formData.type || !formData.price) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      // API 호출 로직
      console.log('제품 등록:', formData, images);
      alert('제품이 등록되었습니다.');
      
      // 폼 초기화
      setFormData({
        name: '',
        type: '',
        alcohol: '',
        volume: '',
        price: '',
        stock: '',
        description: '',
        ingredients: '',
        origin: '',
        manufacturer: ''
      });
      setImages([]);
      setPreviewUrls([]);
    } catch (error) {
      alert('제품 등록에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>제품 등록</h1>
        <p className={styles.subtitle}>새로운 전통주 제품을 등록합니다</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 기본 정보 */}
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
                주종 <span className={styles.required}>*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="">선택하세요</option>
                <option value="막걸리">막걸리</option>
                <option value="청주">청주</option>
                <option value="약주">약주</option>
                <option value="증류주">증류주</option>
                <option value="과실주">과실주</option>
                <option value="리큐르">리큐르</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>알코올 도수</label>
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
              />
              <span className={styles.unit}>%</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>용량</label>
              <input
                type="number"
                name="volume"
                value={formData.volume}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 750"
              />
              <span className={styles.unit}>ml</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                판매가격 <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 15000"
                required
              />
              <span className={styles.unit}>원</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>재고 수량</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 100"
                min="0"
              />
              <span className={styles.unit}>개</span>
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
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

          <div className={styles.formGroup}>
            <label className={styles.label}>원재료</label>
            <input
              type="text"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="예: 쌀, 누룩, 정제수"
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>원산지</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 경기도 포천시"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>제조사</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="예: 산사원 양조장"
              />
            </div>
          </div>
        </div>

        {/* 제품 이미지 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>제품 이미지</h2>
          <p className={styles.imageNote}>최대 5개까지 등록 가능합니다</p>
          
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

        {/* 버튼 */}
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.cancelBtn}>
            취소
          </button>
          <button type="submit" className={styles.submitBtn}>
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
}