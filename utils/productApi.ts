import apiClient from './api';
import axios from 'axios';

export interface ProductFormData {
  name: string;
  alcohol: string;
  volume: string;
  origin_price: string;
  inventory: string;
  is_online_sell: boolean;
  description?: string;
}

export interface ProductImage {
  file: File;
  seq: number;
}

export interface ProductRegisterRequest {
  formData: ProductFormData;
  images: File[];
}

export interface ApiResponse {
  status: number;
  message: string;
}

const createProductFormData = (formData: ProductFormData, images: File[]): FormData => {
  const formDataToSend = new FormData();
  
  formDataToSend.append('name', formData.name);
  formDataToSend.append('alcohol', formData.alcohol);
  formDataToSend.append('is_online_sell', String(formData.is_online_sell));
  formDataToSend.append('volume', formData.volume);
  formDataToSend.append('origin_price', formData.origin_price);
  formDataToSend.append('inventory', formData.inventory);
  
  if (formData.description) {
    formDataToSend.append('description', formData.description);
  }

  images.forEach((image, index) => {
    formDataToSend.append(`images[${index}].image`, image);
    formDataToSend.append(`images[${index}].seq`, String(index + 1));
  });

  return formDataToSend;
};

export const registerProduct = async (
  formData: ProductFormData,
  images: File[]
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const formDataToSend = createProductFormData(formData, images);

    const response = await apiClient.post<ApiResponse>(
      '/api/seller-priv/product-add',
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
        message: response.data.message || '상품이 등록되었습니다.',
      };
    }

    return {
      success: false,
      error: '상품 등록에 실패했습니다.',
    };
  } catch (error) {
    console.error('상품 등록 오류:', error);

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
      error: '상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
    };
  }
};

export const updateProduct = async (
  productId: number,
  formData: ProductFormData,
  addImages: File[],
  removeImageIds: number[],
  modifyImages: { image_id: number; seq: number }[]
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const formDataToSend = new FormData();
    
    formDataToSend.append('id', String(productId));
    
    if (formData.name) formDataToSend.append('name', formData.name);
    if (formData.alcohol) formDataToSend.append('alcohol', formData.alcohol);
    if (formData.volume) formDataToSend.append('volume', formData.volume);
    if (formData.origin_price) formDataToSend.append('origin_price', formData.origin_price);
    if (formData.description) formDataToSend.append('description', formData.description);
    formDataToSend.append('is_online_sell', String(formData.is_online_sell));

    addImages.forEach((image, index) => {
      formDataToSend.append(`add_images[${index}].image`, image);
      formDataToSend.append(`add_images[${index}].seq`, String(index + 1));
    });

    removeImageIds.forEach((id, index) => {
      formDataToSend.append(`remove_images[${index}]`, String(id));
    });

    modifyImages.forEach((item, index) => {
      formDataToSend.append(`modify_images[${index}].image_id`, String(item.image_id));
      formDataToSend.append(`modify_images[${index}].seq`, String(item.seq));
    });

    const response = await apiClient.post<ApiResponse>(
      '/api/seller-priv/product-update',
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
        message: response.data.message || '상품이 수정되었습니다.',
      };
    }

    return {
      success: false,
      error: '상품 수정에 실패했습니다.',
    };
  } catch (error) {
    console.error('상품 수정 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 404) {
        return {
          success: false,
          error: '상품을 찾을 수 없습니다.',
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
      error: '상품 수정 중 오류가 발생했습니다.',
    };
  }
};

export const deleteProduct = async (
  productId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.delete<ApiResponse>(
      `/api/seller-priv/product/${productId}`
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || '상품이 삭제되었습니다.',
      };
    }

    return {
      success: false,
      error: '상품 삭제에 실패했습니다.',
    };
  } catch (error) {
    console.error('상품 삭제 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 404) {
        return {
          success: false,
          error: '상품을 찾을 수 없습니다.',
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
      error: '상품 삭제 중 오류가 발생했습니다.',
    };
  }
};

export const restoreProduct = async (
  productId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      `/api/seller-priv/product-restore/${productId}`
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || '상품이 복구되었습니다.',
      };
    }

    return {
      success: false,
      error: '상품 복구에 실패했습니다.',
    };
  } catch (error) {
    console.error('상품 복구 오류:', error);

    return {
      success: false,
      error: '상품 복구 중 오류가 발생했습니다.',
    };
  }
};