import apiClient from './api';
import axios from 'axios';

// 오늘 일정 테이블용 데이터 타입
export interface TodaySchedule {
  joyOrderId: number;
  joyName: string;
  reservationTime: string;
  participantCount: number;
  payerName: string;
  payerPhone: string;
  status: string;
}

// 대시보드 통계 데이터
export interface DashboardStats {
  todayRevenue: number;
  todayOrderCount: number;
  todayJoyReservationCount: number;
}

// 대시보드 전체 데이터
export interface DashboardData {
  stats: DashboardStats;
  todaySchedule: TodaySchedule[];
}

// 예약 내역 응답 타입 (experienceApi와 동일)
interface ReservationOrder {
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

interface ReservationHistoryResponse {
  status: number;
  content: {
    content: ReservationOrder[];
    totalPages: number;
    totalElements: number;
  };
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 오늘 날짜의 예약 목록 조회
const fetchTodayReservations = async (): Promise<ReservationOrder[]> => {
  try {
    const todayDate = getTodayDateString();
    const response = await apiClient.get<ReservationHistoryResponse>(
      `/api/brewery-priv/joy-order/history-date/0/${todayDate}`
    );
    return response.data.content.content || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('오늘 예약 조회 실패:', error.response?.data);
    }
    return [];
  }
};

// 예약 데이터를 TodaySchedule 형식으로 변환
const convertToScheduleFormat = (reservations: ReservationOrder[]): TodaySchedule[] => {
  // 결제 완료된 예약만 필터링하고 시간순 정렬
  return reservations
    .filter(r => r.joy_payment_status === 'PAID')
    .map(r => ({
      joyOrderId: r.joy_order_id,
      joyName: r.joy_name,
      reservationTime: r.joy_order_reservation,
      participantCount: r.joy_order_count,
      payerName: r.joy_order_payer_name,
      payerPhone: r.joy_order_payer_phone,
      status: r.joy_payment_status
    }))
    .sort((a, b) => {
      const timeA = new Date(a.reservationTime).getTime();
      const timeB = new Date(b.reservationTime).getTime();
      return timeA - timeB;
    });
};

// 통계 데이터 계산
const calculateStats = (reservations: ReservationOrder[]): DashboardStats => {
  const paidReservations = reservations.filter(r => r.joy_payment_status === 'PAID');
  
  const todayRevenue = paidReservations.reduce((sum, r) => sum + r.joy_total_price, 0);
  const todayOrderCount = paidReservations.length;
  const todayJoyReservationCount = paidReservations.length;

  return {
    todayRevenue,
    todayOrderCount,
    todayJoyReservationCount
  };
};

// 대시보드 데이터 조회 (메인 함수)
export const fetchDashboardData = async (): Promise<DashboardData> => {
  const reservations = await fetchTodayReservations();
  
  return {
    stats: calculateStats(reservations),
    todaySchedule: convertToScheduleFormat(reservations)
  };
};