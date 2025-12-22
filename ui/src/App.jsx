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
  const [cart, setCart] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})

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

  // 총 금액 계산
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  // 주문하기
  const handleOrder = () => {
    if (cart.length === 0) return
    
    alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
    setCart([])
  }

  // 가격 포맷팅
  const formatPrice = (price) => {
    return price.toLocaleString()
  }

  return (
    <div className="App">
      <header>
        <div className="logo">커피 주문 앱</div>
        <nav>
          <button className="nav-button active">주문하기</button>
          <button className="nav-button">관리자</button>
        </nav>
      </header>

      <main>
        <div className="menu-section">
          <h2>메뉴</h2>
          <div className="menu-grid">
            {menuData.map(menu => (
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
                  >
                    담기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2>장바구니</h2>
          {cart.length === 0 ? (
            <p className="empty-cart">장바구니가 비어있습니다.</p>
          ) : (
            <div className="cart-content">
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">
                        {item.menuName}
                        {item.selectedOptions.length > 0 && (
                          ` (${item.selectedOptions.map(opt => opt.name).join(', ')})`
                        )}
                      </span>
                      <span className="cart-item-quantity">X {item.quantity}</span>
                    </div>
                    <span className="cart-item-price">
                      {formatPrice(item.totalPrice)}원
                    </span>
                  </div>
                ))}
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
      </main>
    </div>
  )
}

export default App

