import apiClient from './api';
import axios from 'axios';

export interface BreweryFormData {
  brewery_name: string;
  brewery_address: string;
  brewery_address_detail: string;
  business_registration_number: string;
  brewery_depositor: string;
  brewery_account_number: string;
  brewery_bank_name: string;
  introduction: string;
  brewery_website: string;
  is_regular_visit: boolean;
  start_time: string;
  end_time: string;
}

export interface BreweryDetail {
  brewery_id: number;
  region_type_id?: number;
  region_type_name?: string;
  brewery_name: string;
  brewery_address: string;
  brewery_address_detail: string;
  brewery_registered_at: string;
  brewery_business_registration_number: string;
  brewery_depositor: string;
  brewery_account_number: string;
  brewery_bank_name: string;
  brewery_introduction: string;
  brewery_website: string;
  brewery_start_time: string;
  brewery_end_time: string;
  brewery_is_regular_visit: boolean;
  brewery_is_visiting_brewery: boolean;
  brewery_is_agreed_brewery: boolean;
  brewery_is_deleted: boolean;
}

export interface UserInfo {
  users_id: number;
  role_name: string;
  users_email: string;
  users_nickname: string;
  users_name: string;
  users_phone: string;
  users_birth: string;
  users_gender: string;
  users_address: string;
  users_address_detail: string;
  brewery?: BreweryDetail;
}

export interface ApiResponse {
  status: number;
  message: string;
  content?: any;
}

export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await apiClient.get<ApiResponse>('/api/user/my');
    return response.data.content;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    throw error;
  }
};

export const updateBrewery = async (
  formData: BreweryFormData,
  addImages?: File[],
  removeImageIds?: number[]
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const formDataToSend = new FormData();
    
    if (formData.brewery_name) {
      formDataToSend.append('brewery_name', formData.brewery_name);
    }
    if (formData.brewery_address) {
      formDataToSend.append('brewery_address', formData.brewery_address);
    }
    if (formData.brewery_address_detail) {
      formDataToSend.append('brewery_address_detail', formData.brewery_address_detail);
    }
    if (formData.business_registration_number) {
      formDataToSend.append('business_registration_number', formData.business_registration_number);
    }
    if (formData.brewery_depositor) {
      formDataToSend.append('brewery_depositor', formData.brewery_depositor);
    }
    if (formData.brewery_account_number) {
      formDataToSend.append('brewery_account_number', formData.brewery_account_number);
    }
    if (formData.brewery_bank_name) {
      formDataToSend.append('brewery_bank_name', formData.brewery_bank_name);
    }
    if (formData.introduction) {
      formDataToSend.append('introduction', formData.introduction);
    }
    if (formData.brewery_website) {
      formDataToSend.append('brewery_website', formData.brewery_website);
    }
    
    formDataToSend.append('is_regular_visit', String(formData.is_regular_visit));
    formDataToSend.append('start_time', formData.start_time);
    formDataToSend.append('end_time', formData.end_time);

    if (removeImageIds && removeImageIds.length > 0) {
      removeImageIds.forEach((id) => {
        formDataToSend.append('remove_images', String(id));
      });
    }

    const response = await apiClient.post<ApiResponse>(
      '/api/brewery-priv/update',
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
        message: response.data.message || '양조장 정보가 수정되었습니다.',
      };
    }

    return {
      success: false,
      error: '양조장 정보 수정에 실패했습니다.',
    };
  } catch (error) {
    console.error('양조장 정보 수정 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      
      if (status === 404) {
        return {
          success: false,
          error: message || '양조장 정보를 찾을 수 없습니다.',
        };
      } else if (status === 403) {
        return {
          success: false,
          error: message || '권한이 없습니다.',
        };
      } else if (status === 400) {
        return {
          success: false,
          error: message || '입력 정보를 확인해주세요.',
        };
      }
    }

    return {
      success: false,
      error: '양조장 정보 수정 중 오류가 발생했습니다.',
    };
  }
};