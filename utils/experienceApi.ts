import apiClient from './api';
import axios from 'axios';

export interface ExperienceFormData {
  name: string;
  place: string;
  detail: string;
  origin_price: string;
  discount_rate: string;
  final_price: string;
  sales_volume?: string;
  time_unit: string;
  is_soldout: boolean;
  volume?: string;
}

export interface ApiResponse {
  status: number;
  message: string;
}

const createExperienceFormData = (formData: ExperienceFormData, image: File): FormData => {
  const formDataToSend = new FormData();
  
  formDataToSend.append('name', formData.name);
  formDataToSend.append('place', formData.place);
  formDataToSend.append('detail', formData.detail);
  formDataToSend.append('origin_price', formData.origin_price);
  formDataToSend.append('discount_rate', formData.discount_rate);
  formDataToSend.append('time_unit', formData.time_unit);
  formDataToSend.append('is_soldout', String(formData.is_soldout));
  
  if (formData.sales_volume) {
    formDataToSend.append('sales_volume', formData.sales_volume);
  }
  
  if (formData.volume) {
    formDataToSend.append('volume', formData.volume);
  }

  formDataToSend.append('image', image);

  return formDataToSend;
};

export const registerExperience = async (
  formData: ExperienceFormData,
  image: File
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const formDataToSend = createExperienceFormData(formData, image);

    const response = await apiClient.post<ApiResponse>(
      '/api/seller-priv/experience-add',
      formDataToSend,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || '체험 상품이 등록되었습니다.',
      };
    }

    return {
      success: false,
      error: '체험 상품 등록에 실패했습니다.',
    };
  } catch (error) {
    console.error('체험 상품 등록 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 404) {
        return {
          success: false,
          error: '판매자 정보를 찾을 수 없습니다. 로그인 상태를 확인해주세요.',
        };
      } else if (status === 403) {
        return {
          success: false,
          error: '권한이 없습니다. 판매자 또는 양조장 계정으로 로그인해주세요.',
        };
      } else if (status === 400) {
        return {
          success: false,
          error: error.response?.data?.message || '입력 정보를 확인해주세요.',
        };
      }
    }

    return {
      success: false,
      error: '체험 상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
    };
  }
};

export const updateExperience = async (
  experienceId: number,
  formData: ExperienceFormData,
  image?: File
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const formDataToSend = new FormData();
    
    formDataToSend.append('id', String(experienceId));
    formDataToSend.append('name', formData.name);
    formDataToSend.append('place', formData.place);
    formDataToSend.append('detail', formData.detail);
    formDataToSend.append('origin_price', formData.origin_price);
    formDataToSend.append('discount_rate', formData.discount_rate);
    formDataToSend.append('time_unit', formData.time_unit);
    formDataToSend.append('is_soldout', String(formData.is_soldout));
    
    if (formData.sales_volume) {
      formDataToSend.append('sales_volume', formData.sales_volume);
    }
    
    if (formData.volume) {
      formDataToSend.append('volume', formData.volume);
    }

    if (image) {
      formDataToSend.append('image', image);
    }

    const response = await apiClient.post<ApiResponse>(
      '/api/seller-priv/experience-update',
      formDataToSend,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || '체험 상품이 수정되었습니다.',
      };
    }

    return {
      success: false,
      error: '체험 상품 수정에 실패했습니다.',
    };
  } catch (error) {
    console.error('체험 상품 수정 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 404) {
        return {
          success: false,
          error: '체험 상품을 찾을 수 없습니다.',
        };
      } else if (status === 403) {
        return {
          success: false,
          error: '권한이 없습니다.',
        };
      }
    }

    return {
      success: false,
      error: '체험 상품 수정 중 오류가 발생했습니다.',
    };
  }
};

export const deleteExperience = async (
  experienceId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.delete<ApiResponse>(
      `/api/seller-priv/experience/${experienceId}`
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || '체험 상품이 삭제되었습니다.',
      };
    }

    return {
      success: false,
      error: '체험 상품 삭제에 실패했습니다.',
    };
  } catch (error) {
    console.error('체험 상품 삭제 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 404) {
        return {
          success: false,
          error: '체험 상품을 찾을 수 없습니다.',
        };
      } else if (status === 403) {
        return {
          success: false,
          error: '권한이 없습니다.',
        };
      }
    }

    return {
      success: false,
      error: '체험 상품 삭제 중 오류가 발생했습니다.',
    };
  }
};

export const restoreExperience = async (
  experienceId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      `/api/seller-priv/experience-restore/${experienceId}`
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || '체험 상품이 복구되었습니다.',
      };
    }

    return {
      success: false,
      error: '체험 상품 복구에 실패했습니다.',
    };
  } catch (error) {
    console.error('체험 상품 복구 오류:', error);

    return {
      success: false,
      error: '체험 상품 복구 중 오류가 발생했습니다.',
    };
  }
};