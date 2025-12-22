import { useState } from 'react'
import './App.css'

// 임시 메뉴 데이터
const menuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원한 아이스 아메리카노',
    image: '/americano-ice.jpg',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻한 핫 아메리카노',
    image: '/americano-hot.jpg',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 카페라떼',
    image: '/caffe-latte.jpg',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5500,
    description: '우유 거품이 풍부한 카푸치노',
    image: '',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 5,
    name: '바닐라라떼',
    price: 5500,
    description: '달콤한 바닐라라떼',
    image: '',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 6,
    name: '에스프레소',
    price: 3500,
    description: '진한 에스프레소',
    image: '',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  }
]

function App() {
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'
  const [cart, setCart] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})
  
  // 주문 데이터 (주문하기 화면과 관리자 화면에서 공유)
  const [orders, setOrders] = useState([])
  
  // 재고 데이터 (관리자 화면에서 관리)
  const [inventory, setInventory] = useState([
    { menuId: 1, menuName: '아메리카노(ICE)', stock: 10 },
    { menuId: 2, menuName: '아메리카노(HOT)', stock: 8 },
    { menuId: 3, menuName: '카페라떼', stock: 5 },
    { menuId: 4, menuName: '카푸치노', stock: 7 },
    { menuId: 5, menuName: '바닐라라떼', stock: 6 },
    { menuId: 6, menuName: '에스프레소', stock: 9 }
  ])

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
  const handleOrder = () => {
    if (cart.length === 0) return
    
    // 재고 확인
    const insufficientStock = []
    const stockCheck = cart.every(item => {
      const inventoryItem = inventory.find(inv => inv.menuId === item.menuId)
      if (!inventoryItem) {
        insufficientStock.push(`${item.menuName} (재고 정보 없음)`)
        return false
      }
      if (inventoryItem.stock < item.quantity) {
        insufficientStock.push(`${item.menuName} (재고: ${inventoryItem.stock}개, 주문: ${item.quantity}개)`)
        return false
      }
      return true
    })
    
    // 재고 부족 시 주문 실패
    if (!stockCheck) {
      alert(`주문 실패: 재고가 부족합니다.\n\n${insufficientStock.join('\n')}`)
      return
    }
    
    // 재고 차감
    const updatedInventory = inventory.map(invItem => {
      const cartItem = cart.find(item => item.menuId === invItem.menuId)
      if (cartItem) {
        return {
          ...invItem,
          stock: invItem.stock - cartItem.quantity
        }
      }
      return invItem
    })
    setInventory(updatedInventory)
    
    // 주문 생성
    const newOrder = {
      id: Date.now(),
      orderDate: new Date(),
      items: cart.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        quantity: item.quantity,
        price: item.basePrice,
        selectedOptions: item.selectedOptions,
        totalPrice: item.totalPrice
      })),
      totalAmount: calculateTotal(),
      status: 'pending' // pending -> received -> preparing -> completed
    }
    
    setOrders([newOrder, ...orders])
    alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
    setCart([])
  }

  // 가격 포맷팅
  const formatPrice = (price) => {
    return price.toLocaleString()
  }

  // 재고 증가/감소
  const updateStock = (menuId, delta) => {
    setInventory(prev => prev.map(item => 
      item.menuId === menuId 
        ? { ...item, stock: Math.max(0, item.stock + delta) }
        : item
    ))
  }

  // 주문 상태 변경
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  // 대시보드 통계 계산
  const getDashboardStats = () => {
    return {
      totalOrders: orders.length,
      receivedOrders: orders.filter(o => o.status === 'received').length,
      preparingOrders: orders.filter(o => o.status === 'preparing').length,
      completedOrders: orders.filter(o => o.status === 'completed').length
    }
  }

  const stats = getDashboardStats()

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

    // 주문 목록 (pending, received, preparing 상태 표시)
    const pendingOrders = orders.filter(o => 
      o.status === 'pending' || o.status === 'received' || o.status === 'preparing'
    )

    return (
      <>
        {/* 관리자 대시보드 */}
        <div className="admin-dashboard">
          <h2>관리자 대시보드</h2>
          <div className="dashboard-stats">
            <div className="stat-item">
              <span className="stat-label">총 주문</span>
              <span className="stat-value">{stats.totalOrders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">주문 접수</span>
              <span className="stat-value">{stats.receivedOrders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">제조 중</span>
              <span className="stat-value">{stats.preparingOrders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">제조 완료</span>
              <span className="stat-value">{stats.completedOrders}</span>
            </div>
          </div>
        </div>

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
                          {item.selectedOptions.length > 0 && (
                            ` (${item.selectedOptions.map(opt => opt.name).join(', ')})`
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

