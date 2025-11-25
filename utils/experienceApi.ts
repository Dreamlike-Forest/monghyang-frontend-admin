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

export interface Experience {
  joy_id: number;
  joy_name: string;
  joy_place: string;
  joy_detail: string;
  joy_origin_price: number;
  joy_discount_rate: number;
  joy_final_price: number;
  joy_sales_volume: number;
  joy_image_key: string | null;
  joy_is_soldout: boolean;
  joy_time_unit: number;
  joy_max_count: number;
  joy_is_deleted: boolean;
}

export interface ExperienceListResponse {
  status: number;
  content: Experience[];
}

export const fetchExperienceList = async (): Promise<Experience[]> => {
  try {
    const response = await apiClient.get<ExperienceListResponse>('/api/brewery-priv/joy');
    return response.data.content || [];
  } catch (error) {
    console.error('체험 목록 조회 실패:', error);
    throw error;
  }
};

export const setSoldout = async (joyId: number): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      `/api/brewery-priv/joy-set-soldout/${joyId}`
    );
    return {
      success: response.status === 200,
      message: response.data.message || '체험이 품절 처리되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      return { success: false, error: message || '품절 처리 중 오류가 발생했습니다.' };
    }
    return { success: false, error: '품절 처리 중 오류가 발생했습니다.' };
  }
};

export const unsetSoldout = async (joyId: number): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.post<ApiResponse>(
      `/api/brewery-priv/joy-unset-soldout/${joyId}`
    );
    return {
      success: response.status === 200,
      message: response.data.message || '체험이 품절 상태에서 복구되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      return { success: false, error: message || '품절 해제 중 오류가 발생했습니다.' };
    }
    return { success: false, error: '품절 해제 중 오류가 발생했습니다.' };
  }
};

export interface ReservationOrder {
  joy_order_id: number;
  user_id: number;
  joy_id: number;
  joy_name: string;
  joy_order_count: number;
  joy_total_price: number;
  joy_order_payer_name: string;
  joy_order_payer_phone: string;
  joy_order_created_at: string;
  joy_order_reservation: string;
  joy_payment_status: 'PENDING' | 'PAID' | 'CANCELED' | 'FAILED';
}

export interface ReservationHistoryResponse {
  status: number;
  content: {
    content: ReservationOrder[];
    pageable: any;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

export const fetchReservationHistory = async (startOffset: number = 0): Promise<ReservationHistoryResponse['content']> => {
  try {
    const response = await apiClient.get<ReservationHistoryResponse>(
      `/api/brewery-priv/joy-order/history/${startOffset}`
    );
    return response.data.content;
  } catch (error) {
    console.error('예약 내역 조회 실패:', error);
    throw error;
  }
};

export const fetchReservationHistoryByDate = async (
  startOffset: number = 0,
  date: string
): Promise<ReservationHistoryResponse['content']> => {
  try {
    const response = await apiClient.get<ReservationHistoryResponse>(
      `/api/brewery-priv/joy-order/history-date/${startOffset}/${date}`
    );
    return response.data.content;
  } catch (error) {
    console.error('특정 날짜 예약 조회 실패:', error);
    throw error;
  }
};

export const deleteReservation = async (joyOrderId: number): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.delete<ApiResponse>(
      `/api/brewery-priv/joy-order/${joyOrderId}`
    );
    return {
      success: response.status === 200,
      message: response.data.message || '예약이 삭제되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      return { success: false, error: message || '예약 삭제 중 오류가 발생했습니다.' };
    }
    return { success: false, error: '예약 삭제 중 오류가 발생했습니다.' };
  }
};

export interface ManualReservationData {
  id: number;
  count: number;
  payer_name: string;
  payer_phone: string;
  reservation_date: string;
  reservation_time: string;
  total_amount: number;
}

export const createManualReservation = async (
  data: ManualReservationData
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const prepareFormData = new FormData();
    prepareFormData.append('id', String(data.id));
    prepareFormData.append('count', String(data.count));
    prepareFormData.append('payer_name', data.payer_name);
    prepareFormData.append('payer_phone', data.payer_phone);
    prepareFormData.append('reservation_date', data.reservation_date);
    prepareFormData.append('reservation_time', data.reservation_time);

    const prepareResponse = await apiClient.post(
      '/api/joy-order/prepare',
      prepareFormData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    const pgOrderId = prepareResponse.data.content;
    const totalAmountFixed = data.total_amount.toFixed(2);

    const requestFormData = new FormData();
    requestFormData.append('pg_order_id', pgOrderId);
    requestFormData.append('pg_payment_key', 'MANUAL_RESERVATION_KEY');
    requestFormData.append('total_amount', totalAmountFixed);

    await apiClient.post(
      '/api/joy-order/request',
      requestFormData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return {
      success: true,
      message: '수기 예약이 등록되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      
      if (status === 500) {
        return { success: false, error: message || '서버 오류가 발생했습니다.' };
      }
      if (status === 400) {
        return { success: false, error: message || '입력 정보를 확인해주세요.' };
      }
      if (status === 404) {
        return { success: false, error: '체험 프로그램을 찾을 수 없습니다.' };
      }
    }
    return { success: false, error: '예약 등록 중 오류가 발생했습니다.' };
  }
};

// 예약 취소(환불) 요청
export const cancelReservation = async (
  joyOrderId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.delete<ApiResponse>(
      `/api/joy-order/cancel/${joyOrderId}`
    );
    return {
      success: response.status === 200,
      message: response.data.message || '예약이 취소되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      return { success: false, error: message || '예약 취소 중 오류가 발생했습니다.' };
    }
    return { success: false, error: '예약 취소 중 오류가 발생했습니다.' };
  }
};

// 예약 내역 기록 삭제
export const deleteReservationHistory = async (
  joyOrderId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient.delete<ApiResponse>(
      `/api/joy-order/history/${joyOrderId}`
    );
    return {
      success: response.status === 200,
      message: response.data.message || '예약 내역이 삭제되었습니다.'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      return { success: false, error: message || '예약 내역 삭제 중 오류가 발생했습니다.' };
    }
    return { success: false, error: '예약 내역 삭제 중 오류가 발생했습니다.' };
  }
};

// 특정 달의 특정 체험의 예약 달력 조회
export interface CalendarSlotDate {
  joyId: number;
  year: number;
  month: number;
  impossibleDates: number[];
}

export interface CalendarSlotDateResponse {
  status: number;
  content: CalendarSlotDate;
}

export const fetchCalendarSlots = async (
  joyId: number,
  year: number,
  month: number
): Promise<CalendarSlotDate> => {
  try {
    const response = await apiClient.get<CalendarSlotDateResponse>(
      '/api/joy-order/calendar',
      { params: { joyId, year, month } }
    );
    return response.data.content;
  } catch (error) {
    console.error('달력 조회 실패:', error);
    throw error;
  }
};

// 특정 날의 시간대별로 예약 가능 인원수 조회
export interface TimeSlot {
  time: string;
  remainingCount: number;
}

export interface TimeSlotResponse {
  status: number;
  content: {
    joyId: number;
    date: string;
    timeList: TimeSlot[];
  };
}

export const fetchTimeSlots = async (
  joyId: number,
  date: string
): Promise<TimeSlot[]> => {
  try {
    const response = await apiClient.get<TimeSlotResponse>(
      '/api/joy-order/calendar/time-info',
      { params: { joyId, date } }
    );
    return response.data.content.timeList;
  } catch (error) {
    console.error('시간대별 예약 정보 조회 실패:', error);
    throw error;
  }
};