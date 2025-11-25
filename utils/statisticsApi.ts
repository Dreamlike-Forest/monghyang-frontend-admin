import apiClient from './api';

export interface DashboardStats {
  todayRevenue: number;
  todayOrderCount: number;
  todayJoyReservationCount: number;
  pendingOrderCount: number;
  pendingJoyCount: number;
}

export interface TodaySchedule {
  joyOrderId: number;
  joyName: string;
  reservationTime: string;
  participantCount: number;
  payerName: string;
  payerPhone: string;
  status: string;
}

export interface RecentOrder {
  orderId: number;
  payerName: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  itemCount: number;
}

export interface RecentJoyReservation {
  joyOrderId: number;
  joyName: string;
  payerName: string;
  participantCount: number;
  totalAmount: number;
  reservationTime: string;
  paymentStatus: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  todaySchedule: TodaySchedule[];
  recentOrders: RecentOrder[];
  recentJoyReservations: RecentJoyReservation[];
}

export interface DashboardResponse {
  status: number;
  content: DashboardData;
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await apiClient.get<DashboardResponse>('/api/seller-priv/dashboard');
    return response.data.content;
  } catch (error) {
    console.error('대시보드 데이터 조회 실패:', error);
    throw error;
  }
};