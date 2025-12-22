import { useState, useEffect } from 'react'
import './App.css'
import { menuAPI, orderAPI } from './api.js'

function App() {
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'
  const [cart, setCart] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})
  
  // 메뉴 데이터 (API에서 가져옴)
  const [menuData, setMenuData] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 주문 데이터 (주문하기 화면과 관리자 화면에서 공유)
  const [orders, setOrders] = useState([])
  
  // 전체 주문 데이터 (모달에서 사용)
  const [allOrders, setAllOrders] = useState([])
  
  // 재고 데이터 (API에서 가져옴)
  const [inventory, setInventory] = useState([])
  
  // 통계 데이터
  const [stats, setStats] = useState({
    totalOrders: 0,
    receivedOrders: 0,
    preparingOrders: 0,
    completedOrders: 0
  })
  
  // 모달 상태 (선택된 통계 타입)
  const [selectedStatType, setSelectedStatType] = useState(null)
  
  // 메뉴 및 재고 데이터 로드
  useEffect(() => {
    loadMenus()
    loadOrders()
  }, [])
  
  // 관리자 화면 진입 시 재고 및 주문 데이터 새로고침
  useEffect(() => {
    if (currentView === 'admin') {
      loadMenus(true) // 재고 정보 포함
      loadOrders()
      loadAllOrders() // 전체 주문 목록도 로드
      loadStats()
    }
  }, [currentView])
  
  // 주문 목록 변경 시 통계 업데이트
  useEffect(() => {
    if (currentView === 'admin') {
      loadStats()
    }
  }, [orders, currentView])
  
  // 메뉴 데이터 로드
  const loadMenus = async (includeStock = false) => {
    try {
      setLoading(true)
      const response = await menuAPI.getMenus(includeStock)
      if (response.success) {
        setMenuData(response.data)
        
        // 재고 정보 추출 (API에서 항상 재고 정보를 포함하므로)
        const stockData = response.data.map(menu => ({
          menuId: menu.id,
          menuName: menu.name,
          stock: menu.stock || 0
        }))
        setInventory(stockData)
      }
    } catch (error) {
      console.error('메뉴 로드 오류:', error)
      alert('메뉴를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }
  
  // 주문 목록 로드
  const loadOrders = async () => {
    try {
      const response = await orderAPI.getOrders('pending,received,preparing')
      if (response.success) {
        setOrders(response.data)
      }
    } catch (error) {
      console.error('주문 목록 로드 오류:', error)
    }
  }
  
  // 전체 주문 목록 로드 (모달용)
  const loadAllOrders = async () => {
    try {
      const response = await orderAPI.getOrders('')
      if (response.success) {
        setAllOrders(response.data)
      }
    } catch (error) {
      console.error('전체 주문 목록 로드 오류:', error)
    }
  }
  
  // 통계 로드
  const loadStats = async () => {
    try {
      const response = await orderAPI.getStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('통계 로드 오류:', error)
      // 오류 시 로컬 데이터로 계산
      setStats({
        totalOrders: orders.length,
        receivedOrders: orders.filter(o => o.status === 'received').length,
        preparingOrders: orders.filter(o => o.status === 'preparing').length,
        completedOrders: orders.filter(o => o.status === 'completed').length
      })
    }
  }

  // 옵션 선택/해제
  const toggleOption = (menuId, optionId) => {
    setSelectedOptions(prev => {
      const menuOptions = prev[menuId] || []
      const isSelected = menuOptions.includes(optionId)
      
      return {
        ...prev,
        [menuId]: isSelected
          ? menuOptions.filter(id => id !== optionId)
          : [...menuOptions, optionId]
      }
    })
  }

  // 장바구니에 추가
  const addToCart = (menu) => {
    const selectedOptionIds = selectedOptions[menu.id] || []
    const selectedOptionDetails = menu.options.filter(opt => 
      selectedOptionIds.includes(opt.id)
    )

    const cartItem = {
      menuId: menu.id,
      menuName: menu.name,
      basePrice: menu.price,
      selectedOptions: selectedOptionDetails,
      quantity: 1,
      totalPrice: menu.price + selectedOptionDetails.reduce((sum, opt) => sum + opt.price, 0)
    }

    // 동일한 메뉴와 옵션 조합이 있는지 확인
    const existingItemIndex = cart.findIndex(item => 
      item.menuId === cartItem.menuId &&
      JSON.stringify(item.selectedOptions.map(o => o.id).sort()) === 
      JSON.stringify(cartItem.selectedOptions.map(o => o.id).sort())
    )

    if (existingItemIndex >= 0) {
      // 수량 증가
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += 1
      updatedCart[existingItemIndex].totalPrice = 
        updatedCart[existingItemIndex].basePrice * updatedCart[existingItemIndex].quantity +
        updatedCart[existingItemIndex].selectedOptions.reduce((sum, opt) => 
          sum + opt.price * updatedCart[existingItemIndex].quantity, 0
        )
      setCart(updatedCart)
    } else {
      // 새 아이템 추가
      setCart([...cart, cartItem])
    }

    // 옵션 초기화
    setSelectedOptions(prev => ({
      ...prev,
      [menu.id]: []
    }))
  }

  // 장바구니 아이템 수량 증가
  const increaseCartQuantity = (index) => {
    const item = cart[index]
    const inventoryItem = inventory.find(inv => inv.menuId === item.menuId)
    
    // 재고 확인
    if (!inventoryItem) {
      alert(`${item.menuName}: 재고 정보가 없습니다.`)
      return
    }
    
    if (inventoryItem.stock <= item.quantity) {
      alert(`${item.menuName}: 재고가 부족합니다. (재고: ${inventoryItem.stock}개)`)
      return
    }
    
    const updatedCart = [...cart]
    updatedCart[index].quantity += 1
    updatedCart[index].totalPrice = 
      updatedCart[index].basePrice * updatedCart[index].quantity +
      updatedCart[index].selectedOptions.reduce((sum, opt) => 
        sum + opt.price * updatedCart[index].quantity, 0
      )
    setCart(updatedCart)
  }

  // 장바구니 아이템 수량 감소
  const decreaseCartQuantity = (index) => {
    const updatedCart = [...cart]
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1
      updatedCart[index].totalPrice = 
        updatedCart[index].basePrice * updatedCart[index].quantity +
        updatedCart[index].selectedOptions.reduce((sum, opt) => 
          sum + opt.price * updatedCart[index].quantity, 0
        )
      setCart(updatedCart)
    } else {
      // 수량이 1이면 삭제
      removeCartItem(index)
    }
  }

  // 장바구니 아이템 삭제
  const removeCartItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index)
    setCart(updatedCart)
  }

  // 총 금액 계산
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  // 주문하기
  const handleOrder = async () => {
    if (cart.length === 0) return
    
    try {
      // API로 주문 생성
      const orderItems = cart.map(item => ({
        menuId: item.menuId,
        quantity: item.quantity,
        selectedOptionIds: item.selectedOptions.map(opt => opt.id)
      }))
      
      const response = await orderAPI.createOrder(orderItems)
      
      if (response.success) {
        alert(`주문이 완료되었습니다!\n총 금액: ${response.data.totalAmount.toLocaleString()}원`)
        setCart([])
        // 메뉴 및 재고 정보 새로고침
        await loadMenus()
        // 주문 목록 새로고침
        await loadOrders()
        // 전체 주문 목록도 새로고침 (오늘 판매 현황용)
        if (currentView === 'admin') {
          await loadAllOrders()
        }
      }
    } catch (error) {
      console.error('주문 생성 오류:', error)
      if (error.message.includes('재고가 부족')) {
        // 재고 부족 오류는 API에서 상세 정보를 반환하므로 그대로 표시
        alert(`주문 실패: ${error.message}`)
      } else {
        alert(`주문 생성 중 오류가 발생했습니다: ${error.message}`)
      }
    }
  }

  // 가격 포맷팅
  const formatPrice = (price) => {
    return price.toLocaleString()
  }

  // 재고 증가/감소
  const updateStock = async (menuId, delta) => {
    try {
      const response = await menuAPI.updateStock(menuId, delta)
      if (response.success) {
        // 재고 정보 업데이트
        setInventory(prev => prev.map(item => 
          item.menuId === menuId 
            ? { ...item, stock: response.data.stock }
            : item
        ))
        // 메뉴 데이터도 업데이트
        setMenuData(prev => prev.map(menu =>
          menu.id === menuId
            ? { ...menu, stock: response.data.stock }
            : menu
        ))
      }
    } catch (error) {
      console.error('재고 수정 오류:', error)
      alert(`재고 수정 중 오류가 발생했습니다: ${error.message}`)
    }
  }

  // 주문 상태 변경
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId, newStatus)
      if (response.success) {
        // 주문 목록 업데이트
        await loadOrders()
        // 전체 주문 목록도 업데이트 (모달용)
        await loadAllOrders()
        // 통계 업데이트
        await loadStats()
      }
    } catch (error) {
      console.error('주문 상태 변경 오류:', error)
      alert(`주문 상태 변경 중 오류가 발생했습니다: ${error.message}`)
    }
  }

  // 대시보드 통계는 loadStats에서 API로 가져옴

  // 주문하기 화면
  const OrderScreen = () => {
    // 메뉴의 재고 확인 함수
    const getMenuStock = (menuId) => {
      const inventoryItem = inventory.find(inv => inv.menuId === menuId)
      return inventoryItem ? inventoryItem.stock : 0
    }

    return (
      <>
        <div className="menu-section">
          <h2>메뉴</h2>
          <div className="menu-grid">
            {menuData.map(menu => {
              const stock = getMenuStock(menu.id)
              const isOutOfStock = stock === 0
              
              return (
            <div key={menu.id} className="menu-card">
              <div className="menu-image">
                {menu.image ? (
                  <img src={menu.image} alt={menu.name} />
                ) : (
                  <div className="image-placeholder">이미지</div>
                )}
              </div>
              <div className="menu-info">
                <h3 className="menu-name">{menu.name}</h3>
                <p className="menu-price">{formatPrice(menu.price)}원</p>
                <p className="menu-description">{menu.description}</p>
                
                <div className="menu-options">
                  {menu.options.map(option => {
                    const isSelected = (selectedOptions[menu.id] || []).includes(option.id)
                    return (
                      <label key={option.id} className="option-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOption(menu.id, option.id)}
                        />
                        <span>
                          {option.name} ({option.price > 0 ? `+${formatPrice(option.price)}원` : '+0원'})
                        </span>
                      </label>
                    )
                  })}
                </div>
                
                <button 
                  className="add-to-cart-button"
                  onClick={() => addToCart(menu)}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? '품절' : '담기'}
                </button>
              </div>
            </div>
              )
            })}
        </div>
      </div>

      <div className="cart-section">
        <h2>장바구니</h2>
        {cart.length === 0 ? (
          <p className="empty-cart">장바구니가 비어있습니다.</p>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item, index) => {
                const inventoryItem = inventory.find(inv => inv.menuId === item.menuId)
                const stock = inventoryItem ? inventoryItem.stock : 0
                const isOutOfStock = stock === 0
                const isLowStock = stock < item.quantity
                
                return (
                <div key={index} className={`cart-item ${isOutOfStock ? 'cart-item-out-of-stock' : isLowStock ? 'cart-item-low-stock' : ''}`}>
                  <div className="cart-item-info">
                    <span className="cart-item-name">
                      {item.menuName}
                      {item.selectedOptions.length > 0 && (
                        ` (${item.selectedOptions.map(opt => opt.name).join(', ')})`
                      )}
                    </span>
                    {isOutOfStock && (
                      <span className="cart-item-warning">⚠️ 품절된 메뉴입니다</span>
                    )}
                    {isLowStock && !isOutOfStock && (
                      <span className="cart-item-warning">⚠️ 재고 부족 (재고: {stock}개)</span>
                    )}
                    <div className="cart-item-controls">
                      <button 
                        className="cart-quantity-button"
                        onClick={() => decreaseCartQuantity(index)}
                      >
                        -
                      </button>
                      <span className="cart-item-quantity">{item.quantity}</span>
                      <button 
                        className="cart-quantity-button"
                        onClick={() => increaseCartQuantity(index)}
                        disabled={isOutOfStock || stock <= item.quantity}
                      >
                        +
                      </button>
                      <button 
                        className="cart-remove-button"
                        onClick={() => removeCartItem(index)}
                        title="삭제"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <span className="cart-item-price">
                    {formatPrice(item.totalPrice)}원
                  </span>
                </div>
                )
              })}
            </div>
            <div className="cart-summary">
              <div className="total-amount">
                <span className="total-label">총 금액</span>
                <span className="total-price">{formatPrice(calculateTotal())}원</span>
              </div>
              <button 
                className="order-button"
                onClick={handleOrder}
              >
                주문하기
              </button>
            </div>
          </div>
        )}
      </div>
    </>
    )
  }

  // 관리자 화면
  const AdminScreen = () => {
    // 재고 상태 판단
    const getStockStatus = (stock) => {
      if (stock === 0) return { text: '품절', color: '#f44336' }
      if (stock < 5) return { text: '주의', color: '#ff9800' }
      return { text: '정상', color: '#4caf50' }
    }

    // 날짜 포맷팅
    const formatDate = (date) => {
      const d = new Date(date)
      const month = d.getMonth() + 1
      const day = d.getDate()
      const hours = d.getHours()
      const minutes = d.getMinutes().toString().padStart(2, '0')
      return `${month}월 ${day}일 ${hours}:${minutes}`
    }
    
    // 주문 상태 한글 변환
    const getStatusLabel = (status) => {
      const statusMap = {
        'pending': '대기',
        'received': '주문 접수',
        'preparing': '제조 중',
        'completed': '제조 완료',
        'cancelled': '취소됨'
      }
      return statusMap[status] || status
    }

    // 주문 목록 (pending, received, preparing 상태 표시)
    const pendingOrders = orders.filter(o => 
      o.status === 'pending' || o.status === 'received' || o.status === 'preparing'
    )
    
    // 통계 클릭 핸들러
    const handleStatClick = async (statType) => {
      setSelectedStatType(statType)
      await loadAllOrders() // 최신 데이터 로드
    }
    
    // 모달 닫기
    const closeModal = () => {
      setSelectedStatType(null)
    }
    
    // 필터링된 주문 목록 가져오기
    const getFilteredOrders = () => {
      if (!selectedStatType) return []
      
      switch (selectedStatType) {
        case 'total':
          return allOrders
        case 'received':
          return allOrders.filter(o => o.status === 'received')
        case 'preparing':
          return allOrders.filter(o => o.status === 'preparing')
        case 'completed':
          return allOrders.filter(o => o.status === 'completed')
        default:
          return []
      }
    }
    
    const filteredOrders = getFilteredOrders()
    const modalTitle = selectedStatType === 'total' ? '총 주문 내역' :
                       selectedStatType === 'received' ? '주문 접수 내역' :
                       selectedStatType === 'preparing' ? '제조 중 내역' :
                       selectedStatType === 'completed' ? '제조 완료 내역' : ''
    
    // 오늘 판매한 커피 종류 및 수량 계산
    const getTodaySales = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)
      
      // 오늘 날짜의 주문 필터링 (completed 상태만)
      const todayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.orderDate)
        return orderDate >= today && orderDate <= todayEnd && order.status === 'completed'
      })
      
      // 메뉴별 수량 집계
      const salesMap = new Map()
      
      todayOrders.forEach(order => {
        order.items.forEach(item => {
          const menuName = item.menuName
          const quantity = item.quantity
          
          if (salesMap.has(menuName)) {
            salesMap.set(menuName, salesMap.get(menuName) + quantity)
          } else {
            salesMap.set(menuName, quantity)
          }
        })
      })
      
      // 배열로 변환하고 수량 내림차순 정렬
      const salesArray = Array.from(salesMap.entries())
        .map(([menuName, quantity]) => ({ menuName, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
      
      return salesArray
    }
    
    const todaySales = getTodaySales()
    const todayDateStr = new Date().toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    // 일자별, 메뉴별 판매 현황 계산
    const getDateMenuSales = () => {
      // 완료된 주문만 필터링
      const completedOrders = allOrders.filter(order => order.status === 'completed')
      
      // 일자별, 메뉴별 수량 집계
      const salesMap = new Map() // key: "날짜|메뉴명", value: 수량
      const dateSet = new Set()
      const menuSet = new Set()
      
      completedOrders.forEach(order => {
        const orderDate = new Date(order.orderDate)
        const dateStr = orderDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        
        dateSet.add(dateStr)
        
        order.items.forEach(item => {
          const menuName = item.menuName
          menuSet.add(menuName)
          
          const key = `${dateStr}|${menuName}`
          const quantity = item.quantity
          
          if (salesMap.has(key)) {
            salesMap.set(key, salesMap.get(key) + quantity)
          } else {
            salesMap.set(key, quantity)
          }
        })
      })
      
      // 일자 목록 정렬 (최신순)
      const dates = Array.from(dateSet).sort((a, b) => {
        const dateA = new Date(a.replace(/\./g, '/'))
        const dateB = new Date(b.replace(/\./g, '/'))
        return dateB - dateA
      })
      
      // 메뉴 목록 정렬 (알파벳순)
      const menus = Array.from(menuSet).sort()
      
      return {
        dates,
        menus,
        salesMap
      }
    }
    
    const dateMenuSales = getDateMenuSales()

    return (
      <>
        {/* 관리자 대시보드 */}
        <div className="admin-dashboard">
          <h2>관리자 대시보드</h2>
          <div className="dashboard-stats">
            <div 
              className="stat-item clickable" 
              onClick={() => handleStatClick('total')}
              title="클릭하여 상세 내역 보기"
            >
              <span className="stat-label">총 주문</span>
              <span className="stat-value">{stats.totalOrders}</span>
            </div>
            <div 
              className="stat-item clickable" 
              onClick={() => handleStatClick('received')}
              title="클릭하여 상세 내역 보기"
            >
              <span className="stat-label">주문 접수</span>
              <span className="stat-value">{stats.receivedOrders}</span>
            </div>
            <div 
              className="stat-item clickable" 
              onClick={() => handleStatClick('preparing')}
              title="클릭하여 상세 내역 보기"
            >
              <span className="stat-label">제조 중</span>
              <span className="stat-value">{stats.preparingOrders}</span>
            </div>
            <div 
              className="stat-item clickable" 
              onClick={() => handleStatClick('completed')}
              title="클릭하여 상세 내역 보기"
            >
              <span className="stat-label">제조 완료</span>
              <span className="stat-value">{stats.completedOrders}</span>
            </div>
          </div>
        </div>
        
        {/* 상세 내역 모달 */}
        {selectedStatType && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modalTitle}</h2>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
              <div className="modal-body">
                {filteredOrders.length === 0 ? (
                  <p className="empty-orders">해당 상태의 주문이 없습니다.</p>
                ) : (
                  <div className="orders-list-modal">
                    {filteredOrders.map(order => (
                      <div key={order.id} className="order-item-modal">
                        <div className="order-info-modal">
                          <div className="order-header-modal">
                            <div className="order-time">{formatDate(order.orderDate)}</div>
                            <div className="order-status-badge" style={{
                              backgroundColor: order.status === 'completed' ? '#4caf50' :
                                              order.status === 'preparing' ? '#2196F3' :
                                              order.status === 'received' ? '#ff9800' :
                                              '#9e9e9e',
                              color: '#fff',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold'
                            }}>
                              {getStatusLabel(order.status)}
                            </div>
                          </div>
                          <div className="order-details">
                            {order.items.map((item, idx) => (
                              <span key={idx} className="order-menu">
                                {item.menuName}
                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                  ` (${item.selectedOptions.map(opt => opt.optionName || opt.name).join(', ')})`
                                )}
                                {' x '}
                                {item.quantity}
                              </span>
                            ))}
                          </div>
                          <div className="order-amount">{formatPrice(order.totalAmount)}원</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 재고 현황 */}
        <div className="inventory-section">
          <h2>재고 현황</h2>
          <div className="inventory-grid">
            {inventory.map(item => {
              const status = getStockStatus(item.stock)
              return (
                <div key={item.menuId} className="inventory-card">
                  <h3 className="inventory-menu-name">{item.menuName}</h3>
                  <div className="inventory-info">
                    <span className="inventory-stock">{item.stock}개</span>
                    <span className="inventory-status" style={{ color: status.color }}>
                      {status.text}
                    </span>
                  </div>
                  <div className="inventory-controls">
                    <button 
                      className="stock-button"
                      onClick={() => updateStock(item.menuId, -1)}
                      disabled={item.stock === 0}
                    >
                      -
                    </button>
                    <button 
                      className="stock-button"
                      onClick={() => updateStock(item.menuId, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 오늘 판매 현황 */}
        <div className="sales-section">
          <h2>오늘 판매 현황</h2>
          <p className="sales-date">{todayDateStr}</p>
          {todaySales.length === 0 ? (
            <p className="empty-sales">오늘 판매된 메뉴가 없습니다.</p>
          ) : (
            <div className="sales-table-container">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th className="sales-table-header">순위</th>
                    <th className="sales-table-header">메뉴명</th>
                    <th className="sales-table-header">판매 수량</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySales.map((sale, index) => (
                    <tr key={index} className="sales-table-row">
                      <td className="sales-table-cell sales-rank">{index + 1}</td>
                      <td className="sales-table-cell sales-menu-name">{sale.menuName}</td>
                      <td className="sales-table-cell sales-quantity">{sale.quantity}개</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 일자별, 메뉴별 판매 현황 */}
        <div className="sales-section">
          <h2>일자별, 메뉴별 판매 현황</h2>
          {dateMenuSales.dates.length === 0 || dateMenuSales.menus.length === 0 ? (
            <p className="empty-sales">판매 데이터가 없습니다.</p>
          ) : (
            <div className="date-menu-table-container">
              <table className="date-menu-table">
                <thead>
                  <tr>
                    <th className="date-menu-table-header date-header">일자</th>
                    {dateMenuSales.menus.map((menu, idx) => (
                      <th key={idx} className="date-menu-table-header menu-header">
                        {menu}
                      </th>
                    ))}
                    <th className="date-menu-table-header total-header">합계</th>
                  </tr>
                </thead>
                <tbody>
                  {dateMenuSales.dates.map((date, dateIdx) => {
                    const rowTotal = dateMenuSales.menus.reduce((sum, menu) => {
                      const key = `${date}|${menu}`
                      return sum + (dateMenuSales.salesMap.get(key) || 0)
                    }, 0)
                    
                    return (
                      <tr key={dateIdx} className="date-menu-table-row">
                        <td className="date-menu-table-cell date-cell">{date}</td>
                        {dateMenuSales.menus.map((menu, menuIdx) => {
                          const key = `${date}|${menu}`
                          const quantity = dateMenuSales.salesMap.get(key) || 0
                          return (
                            <td key={menuIdx} className="date-menu-table-cell quantity-cell">
                              {quantity > 0 ? quantity : '-'}
                            </td>
                          )
                        })}
                        <td className="date-menu-table-cell total-cell">{rowTotal}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="date-menu-table-footer">
                    <td className="date-menu-table-cell total-label">합계</td>
                    {dateMenuSales.menus.map((menu, menuIdx) => {
                      const colTotal = dateMenuSales.dates.reduce((sum, date) => {
                        const key = `${date}|${menu}`
                        return sum + (dateMenuSales.salesMap.get(key) || 0)
                      }, 0)
                      return (
                        <td key={menuIdx} className="date-menu-table-cell total-cell">
                          {colTotal}
                        </td>
                      )
                    })}
                    <td className="date-menu-table-cell grand-total-cell">
                      {dateMenuSales.dates.reduce((sum, date) => {
                        return sum + dateMenuSales.menus.reduce((menuSum, menu) => {
                          const key = `${date}|${menu}`
                          return menuSum + (dateMenuSales.salesMap.get(key) || 0)
                        }, 0)
                      }, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* 주문 현황 */}
        <div className="orders-section">
          <h2>주문 현황</h2>
          {pendingOrders.length === 0 ? (
            <p className="empty-orders">접수된 주문이 없습니다.</p>
          ) : (
            <div className="orders-list">
              {pendingOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <div className="order-time">{formatDate(order.orderDate)}</div>
                    <div className="order-details">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="order-menu">
                          {item.menuName}
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            ` (${item.selectedOptions.map(opt => opt.optionName || opt.name).join(', ')})`
                          )}
                          {' x '}
                          {item.quantity}
                        </span>
                      ))}
                    </div>
                    <div className="order-amount">{formatPrice(order.totalAmount)}원</div>
                  </div>
                  <div className="order-actions">
                    {order.status === 'pending' && (
                      <button 
                        className="order-action-button"
                        onClick={() => updateOrderStatus(order.id, 'received')}
                      >
                        주문 접수
                      </button>
                    )}
                    {order.status === 'received' && (
                      <button 
                        className="order-action-button"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                      >
                        제조 시작
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button 
                        className="order-action-button"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        제조 완료
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="App">
      <header>
        <div className="logo">커피 주문 앱</div>
        <nav>
          <button 
            className={`nav-button ${currentView === 'order' ? 'active' : ''}`}
            onClick={() => setCurrentView('order')}
          >
            주문하기
          </button>
          <button 
            className={`nav-button ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentView('admin')}
          >
            관리자
          </button>
        </nav>
      </header>

      <main>
        {currentView === 'order' ? <OrderScreen /> : <AdminScreen />}
      </main>
    </div>
  )
}

export default App

