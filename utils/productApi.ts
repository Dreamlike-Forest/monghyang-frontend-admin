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

export interface Product {
  product_id: number;
  users_nickname: string;
  product_name: string;
  product_review_star?: number;
  product_review_count?: number;
  product_alcohol: number;
  product_volume: number;
  product_sales_volume: number;
  product_origin_price: string;
  product_discount_rate: string;
  product_final_price: string;
  image_key?: string;
  product_is_online_sell: boolean;
  product_is_soldout: boolean;
  tag_name?: string[];
}

export interface ProductDetail {
  product_id: number;
  product_name: string;
  product_alcohol: number;
  product_sales_volume: number;
  product_volume: number;
  product_description: string;
  product_registered_at: string;
  product_final_price: string;
  product_discount_rate: string;
  product_origin_price: string;
  product_is_online_sell: boolean;
  product_is_soldout: boolean;
  user_nickname?: string;
  product_image_image_key?: Array<{ image_key: string; seq: number }>;
  tags_name?: string[];
}

export interface ProductListResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
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

export const increaseInventory = async (
  productId: number,
  quantity: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      `/api/seller-priv/product-inc-inven/${productId}/${quantity}`
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || `재고가 ${quantity}개 증가했습니다.`,
      };
    }

    return {
      success: false,
      error: '재고 증가에 실패했습니다.',
    };
  } catch (error) {
    console.error('재고 증가 오류:', error);
    return {
      success: false,
      error: '재고 증가 중 오류가 발생했습니다.',
    };
  }
};

export const decreaseInventory = async (
  productId: number,
  quantity: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      `/api/seller-priv/product-dec-inven/${productId}/${quantity}`
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || `재고가 ${quantity}개 감소했습니다.`,
      };
    }

    return {
      success: false,
      error: '재고 감소에 실패했습니다.',
    };
  } catch (error) {
    console.error('재고 감소 오류:', error);
    return {
      success: false,
      error: '재고 감소 중 오류가 발생했습니다.',
    };
  }
};

export const getProducts = async (params?: {
  userId?: number;
  startOffset?: number;
  keyword?: string;
  min_price?: number;
  max_price?: number;
  min_alcohol?: number;
  max_alcohol?: number;
  tag_id_list?: number[];
}): Promise<ProductListResponse> => {
  try {
    let url = '/api/product/latest/0';
    
    if (params?.userId) {
      const offset = params.startOffset || 0;
      url = `/api/product/by-user/${params.userId}/${offset}`;
    } else if (params?.keyword || params?.min_price || params?.max_price || 
               params?.min_alcohol || params?.max_alcohol || params?.tag_id_list) {
      const offset = params.startOffset || 0;
      url = `/api/product/search/${offset}`;
      
      const queryParams = new URLSearchParams();
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.min_price) queryParams.append('min_price', String(params.min_price));
      if (params.max_price) queryParams.append('max_price', String(params.max_price));
      if (params.min_alcohol) queryParams.append('min_alcohol', String(params.min_alcohol));
      if (params.max_alcohol) queryParams.append('max_alcohol', String(params.max_alcohol));
      if (params.tag_id_list) {
        params.tag_id_list.forEach(id => queryParams.append('tag_id_list', String(id)));
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    } else if (params?.startOffset) {
      url = `/api/product/latest/${params.startOffset}`;
    }

    const response = await apiClient.get(url);
    
    return response.data.content;
  } catch (error) {
    console.error('제품 목록 조회 오류:', error);
    throw error;
  }
};

export const getMyProducts = async (startOffset: number = 0): Promise<ProductListResponse> => {
  try {
    const response = await apiClient.get(`/api/seller-priv/product/my/${startOffset}`);
    return response.data.content;
  } catch (error) {
    console.error('내 제품 목록 조회 오류:', error);
    throw error;
  }
};

export const getProduct = async (id: number): Promise<ProductDetail> => {
  try {
    const response = await apiClient.get(`/api/product/${id}`);
    return response.data.content;
  } catch (error) {
    console.error('제품 상세 조회 오류:', error);
    throw error;
  }
};

export const setSoldout = async (
  productId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      `/api/seller-priv/product-set-soldout/${productId}`
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || '상품이 품절 처리되었습니다.',
      };
    }

    return {
      success: false,
      error: '품절 처리에 실패했습니다.',
    };
  } catch (error) {
    console.error('품절 처리 오류:', error);
    return {
      success: false,
      error: '품절 처리 중 오류가 발생했습니다.',
    };
  }
};

export const unsetSoldout = async (
  productId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      `/api/seller-priv/product-unset-soldout/${productId}`
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || '품절이 해제되었습니다.',
      };
    }

    return {
      success: false,
      error: '품절 해제에 실패했습니다.',
    };
  } catch (error) {
    console.error('품절 해제 오류:', error);
    return {
      success: false,
      error: '품절 해제 중 오류가 발생했습니다.',
    };
  }
};

export const updateInventory = async (
  productId: number,
  inventory: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('id', String(productId));
    formData.append('inventory', String(inventory));

    const response = await apiClient.post<ApiResponse>(
      '/api/seller-priv/product-update',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || '재고가 수정되었습니다.',
      };
    }

    return {
      success: false,
      error: '재고 수정에 실패했습니다.',
    };
  } catch (error) {
    console.error('재고 수정 오류:', error);
    return {
      success: false,
      error: '재고 수정 중 오류가 발생했습니다.',
    };
  }
};