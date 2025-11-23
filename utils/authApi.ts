import apiClient from './api';
import axios from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  nickname: string;
  role: string;
}

export interface UserData {
  nickname: string;
  email: string;
  role: string;
}

export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; data?: UserData; error?: string }> => {
  try {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    console.log('로그인 시도:', { 
      email, 
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/login` 
    });

    const response = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://16.184.16.198:61234'}/api/auth/login`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true,
      }
    );

    console.log('로그인 응답:', response.status);
    console.log('응답 본문:', response.data);
    console.log('응답 헤더:', {
      sessionId: response.headers['x-session-id'],
      refreshToken: response.headers['x-refresh-token']
    });

    const sessionId = response.headers['x-session-id'];
    const refreshToken = response.headers['x-refresh-token'];

    if (!sessionId || !refreshToken) {
      console.error('세션 정보 누락:', { sessionId, refreshToken });
      console.error('전체 응답 헤더:', response.headers);
      throw new Error('세션 정보를 받지 못했습니다.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('isLoggedIn', 'true');
      
      const userData: UserData = {
        nickname: response.data.nickname,
        email: email,
        role: response.data.role,
      };
      localStorage.setItem('userData', JSON.stringify(userData));
    }

    return {
      success: true,
      data: {
        nickname: response.data.nickname,
        email: email,
        role: response.data.role,
      },
    };
  } catch (error) {
    console.error('로그인 오류:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      
      console.error('응답 상태:', status);
      console.error('응답 데이터:', responseData);
      console.error('요청 설정:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      });
      
      if (status === 401) {
        return {
          success: false,
          error: '이메일 또는 비밀번호가 일치하지 않습니다.',
        };
      } else if (status === 404) {
        return {
          success: false,
          error: '존재하지 않는 계정입니다.',
        };
      } else if (status === 500) {
        return {
          success: false,
          error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        };
      } else if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          error: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
        };
      } else if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
        };
      }
    }

    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.',
    };
  }
};

export const logout = async (): Promise<boolean> => {
  try {
    await apiClient.post('/api/auth/logout');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('isLoggedIn');
    }

    return true;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('isLoggedIn');
    }
    
    return false;
  }
};