import apiClient from './api';
import axios from 'axios';

export interface ExperienceFormData {
  name: string;
  place: string;
  detail: string;
  origin_price: number;
  time_unit: number;
  max_count: number;
}

export interface ApiResponse {
  status: number;
  message: string;
}

const createExperienceFormData = (formData: ExperienceFormData, image: File): FormData => {
  const data = new FormData();
  
  data.append('name', formData.name);
  data.append('place', formData.place);
  data.append('detail', formData.detail);
  data.append('origin_price', String(formData.origin_price));
  data.append('time_unit', String(formData.time_unit));
  data.append('max_count', String(formData.max_count));
  data.append('image', image);

  return data;
};

export const registerExperience = async (
  formData: ExperienceFormData,
  image: File
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const data = createExperienceFormData(formData, image);

    const response = await apiClient.post<ApiResponse>(
      '/api/brewery-priv/joy-add',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return {
      success: response.status === 200,
      message: response.data.message || '체험 상품이 등록되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      
      if (status === 500) {
        return { success: false, error: message || '서버 오류가 발생했습니다.' };
      }
      if (status === 404) {
        return { success: false, error: '판매자 정보를 찾을 수 없습니다.' };
      }
      if (status === 403) {
        return { success: false, error: '권한이 없습니다.' };
      }
      if (status === 400) {
        return { success: false, error: message || '입력 정보를 확인해주세요.' };
      }
    }

    return { success: false, error: '등록 중 오류가 발생했습니다.' };
  }
};

export const updateExperience = async (
  experienceId: number,
  formData: ExperienceFormData,
  image?: File
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const data = new FormData();
    
    data.append('joy_id', String(experienceId));
    data.append('name', formData.name);
    data.append('place', formData.place);
    data.append('detail', formData.detail);
    data.append('origin_price', String(formData.origin_price));
    data.append('time_unit', String(formData.time_unit));
    data.append('max_count', String(formData.max_count));

    if (image) {
      data.append('image', image);
    }

    const response = await apiClient.post<ApiResponse>(
      '/api/brewery-priv/joy-update',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return {
      success: response.status === 200,
      message: response.data.message || '체험 상품이 수정되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      
      if (status === 500) {
        return { success: false, error: message || '서버 오류가 발생했습니다.' };
      }
      if (status === 404) {
        return { success: false, error: '체험 상품을 찾을 수 없습니다.' };
      }
      if (status === 403) {
        return { success: false, error: '권한이 없습니다.' };
      }
    }

    return { success: false, error: '수정 중 오류가 발생했습니다.' };
  }
};

export const deleteExperience = async (
  experienceId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.delete<ApiResponse>(
      `/api/brewery-priv/joy/${experienceId}`
    );

    return {
      success: response.status === 200,
      message: response.data.message || '체험 상품이 삭제되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      
      if (status === 500) {
        return { success: false, error: message || '서버 오류가 발생했습니다.' };
      }
      if (status === 404) {
        return { success: false, error: '체험 상품을 찾을 수 없습니다.' };
      }
      if (status === 403) {
        return { success: false, error: '권한이 없습니다.' };
      }
    }

    return { success: false, error: '삭제 중 오류가 발생했습니다.' };
  }
};

export const restoreExperience = async (
  experienceId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      `/api/brewery-priv/joy-restore/${experienceId}`
    );

    return {
      success: response.status === 200,
      message: response.data.message || '체험 상품이 복구되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      return { success: false, error: message || '복구 중 오류가 발생했습니다.' };
    }
    return { success: false, error: '복구 중 오류가 발생했습니다.' };
  }
};