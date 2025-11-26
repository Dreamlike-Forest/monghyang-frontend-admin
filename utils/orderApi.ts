import apiClient from './api';
import axios from 'axios';

// 배송 상태 히스토리 타입
export interface FulfillmentHistory {
  order_item_fulfillment_history_id: number;
  order_item_fulfillment_history_to_status: string;
  order_item_fulfillment_history_reason_code: string;
  order_item_fulfillment_history_created_at: string;
}

// 환불 상태 히스토리 타입
export interface RefundHistory {
  order_item_refund_history_id: number;
  order_item_refund_to_status: string;
  order_item_refund_created_at: string;
}

// 상태 히스토리 타입
export interface StatusHistory {
  fulfillment_history: FulfillmentHistory[];
  refund_history: RefundHistory[];
}

// 주문 아이템 타입
export interface OrderItem {
  order_id: number;
  order_item_id: number;
  product_id: number;
  product_name: string;
  provider_id: number;
  provider_nickname: string;
  provider_role: string;
  product_image_key: string | null;
  order_item_quantity: number;
  order_item_amount: number;
  order_item_fulfillment_status: string;
  order_item_refund_status: string;
  order_item_carrier_code: string | null;
  order_item_tracking_no: string | null;
  order_item_shipped_at: string | null;
  order_item_delivered_at: string | null;
  order_item_created_at: string;
  order_item_updated_at: string;
  payer_name: string;
  payer_phone: string;
  payer_address: string;
  payer_address_detail: string;
  status_history: StatusHistory;
}

// 페이징 정보 타입
export interface PageableInfo {
  page_number: number;
  page_size: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
}

// 주문 목록 응답 타입
export interface OrderListResponse {
  content: OrderItem[];
  pageable: PageableInfo;
  last: boolean;
  total_pages: number;
  total_elements: number;
  first: boolean;
  size: number;
  number: number;
  number_of_elements: number;
  empty: boolean;
}

// API 응답 래퍼 타입
interface ApiResponse<T> {
  status: number;
  content: T;
}

// 배송 상태 코드
export type FulfillmentStatus = 'CREATED' | 'ALLOCATED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// 환불 상태 코드
export type RefundStatus = 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

// 배송 상태 텍스트 변환
export const getFulfillmentStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'CREATED': '주문 생성',
    'ALLOCATED': '상품 할당',
    'SHIPPED': '배송중',
    'DELIVERED': '배송 완료',
    'CANCELLED': '배송 취소'
  };
  return statusMap[status] || status;
};

// 환불 상태 텍스트 변환
export const getRefundStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'NONE': '없음',
    'REQUESTED': '환불 요청',
    'APPROVED': '환불 승인',
    'REJECTED': '환불 거절',
    'COMPLETED': '환불 완료'
  };
  return statusMap[status] || status;
};

// 주문 내역 조회
export const getOrderHistory = async (
  startOffset: number = 0
): Promise<{ success: boolean; data?: OrderListResponse; error?: string }> => {
  try {
    const response = await apiClient.get<ApiResponse<OrderListResponse>>(
      `/api/seller-priv/product-order/history/${startOffset}`
    );

    if (response.data.status === 200) {
      return {
        success: true,
        data: response.data.content
      };
    }

    return {
      success: false,
      error: '주문 내역을 불러오는데 실패했습니다.'
    };
  } catch (error) {
    console.error('주문 내역 조회 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 404) {
        return {
          success: true,
          data: {
            content: [],
            pageable: {
              page_number: 0,
              page_size: 12,
              offset: 0,
              paged: true,
              unpaged: false,
              sort: { empty: true, unsorted: true, sorted: false }
            },
            last: true,
            total_pages: 0,
            total_elements: 0,
            first: true,
            size: 12,
            number: 0,
            number_of_elements: 0,
            empty: true
          }
        };
      } else if (status === 401) {
        return {
          success: false,
          error: '로그인이 필요합니다.'
        };
      } else if (status === 403) {
        return {
          success: false,
          error: '판매자 권한이 필요합니다.'
        };
      }
    }

    return {
      success: false,
      error: '주문 내역 조회 중 오류가 발생했습니다.'
    };
  }
};

// 페이지 번호 기반 주문 조회
export const getOrderHistoryByPage = async (
  page: number = 0,
  pageSize: number = 12
): Promise<{ success: boolean; data?: OrderListResponse; error?: string }> => {
  const offset = page * pageSize;
  return getOrderHistory(offset);
};

// 날짜 포맷 유틸리티
export const formatOrderDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 금액 포맷 유틸리티
export const formatPrice = (price: number): string => {
  return `₩${price.toLocaleString()}`;
};