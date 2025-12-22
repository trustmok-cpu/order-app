// API 기본 URL
const API_BASE_URL = 'http://localhost:3000/api';

// API 호출 헬퍼 함수
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API 호출 실패');
    }
    
    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 메뉴 관련 API
export const menuAPI = {
  // 메뉴 목록 조회
  getMenus: (includeStock = false) => {
    return apiCall(`/menus?include_stock=${includeStock}`);
  },
  
  // 특정 메뉴 조회
  getMenu: (menuId) => {
    return apiCall(`/menus/${menuId}`);
  },
  
  // 재고 수정
  updateStock: (menuId, delta) => {
    return apiCall(`/menus/${menuId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ delta })
    });
  }
};

// 주문 관련 API
export const orderAPI = {
  // 주문 생성
  createOrder: (items) => {
    return apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  },
  
  // 주문 목록 조회
  getOrders: (status = null) => {
    const query = status ? `?status=${status}` : '';
    return apiCall(`/orders${query}`);
  },
  
  // 특정 주문 조회
  getOrder: (orderId) => {
    return apiCall(`/orders/${orderId}`);
  },
  
  // 주문 상태 변경
  updateOrderStatus: (orderId, status) => {
    return apiCall(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  
  // 주문 통계 조회
  getStats: () => {
    return apiCall('/orders/stats/all');
  }
};

