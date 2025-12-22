# 커피 주문 앱

## 1. 프로젝트 개요

### 1.1 프로젝트명
커피 주문 앱

### 1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리할 수 있는 간단한 풀스택 웹 앱

### 1.3 개발 범위
- 주문하기 화면(메뉴 선택 및 장바구니 기능)
- 관리자 화면(재고 관리 및 주문 상태 관리)
- 데이터를 생성/조회/수정/삭제할 수 있는 기능

## 2. 기술 스택
- 프런트엔드: HTML, CSS, 리액트, 자바스크립트
- 백엔드: Node.js, Express
- 데이터베이스: PostgresSQL

## 3. 기본사항
- 프런트엔드와 백엔드를 따로 개발
- 기본적인 웹 기술만 사용
- 학습 목적이므로 사용자 인증이나 결제 기능은 제외
- 메뉴는 커피 메뉴만 있음

## 4. 주문하기 화면 PRD

### 4.1 화면 개요
사용자가 커피 메뉴를 선택하고 장바구니에 담아 주문할 수 있는 메인 화면입니다.

### 4.2 화면 구성

#### 4.2.1 헤더 영역
- **위치**: 화면 상단
- **구성 요소**:
  - **로고**: 왼쪽에 "COZY" 텍스트가 들어간 다크 그린 배경의 박스
  - **주문하기 버튼**: 로고 오른쪽에 위치 (현재 화면이므로 활성화 상태)
  - **관리자 버튼**: 주문하기 버튼 오른쪽에 위치 (관리자 화면으로 이동)

#### 4.2.2 메뉴 아이템 영역
- **위치**: 헤더 아래, 화면 중앙
- **레이아웃**: 메뉴 카드들이 가로로 배치 (반응형으로 조정 가능)
- **메뉴 카드 구성 요소**:
  1. **메뉴 이미지**: 상단에 위치한 이미지 영역 (플레이스홀더 또는 실제 이미지)
  2. **메뉴명**: 이미지 아래에 표시 (예: "아메리카노(ICE)", "아메리카노(HOT)", "카페라떼")
  3. **가격**: 메뉴명 아래에 표시 (예: "4,000원", "5,000원")
  4. **설명**: 가격 아래에 간단한 설명 텍스트 (예: "간단한 설명...")
  5. **옵션 선택**:
     - 체크박스 형태의 옵션들
     - 각 옵션은 옵션명과 추가 가격을 표시 (예: "샷 추가 (+500원)", "시럽 추가 (+0원)")
     - 여러 옵션을 동시에 선택 가능
  6. **담기 버튼**: 카드 하단에 위치한 회색 버튼 ("담기" 텍스트)

#### 4.2.3 장바구니 영역
- **위치**: 화면 하단
- **구성 요소**:
  1. **장바구니 제목**: "장바구니" 텍스트
  2. **장바구니 아이템 목록**:
     - 각 아이템은 메뉴명, 선택된 옵션, 수량, 가격을 표시
     - 형식: "메뉴명 (옵션명) X 수량" + "가격원"
     - 예: "아메리카노(ICE) (샷 추가) X 1" + "4,500원"
  3. **총 금액**: 
     - 오른쪽에 "총 금액" 레이블과 함께 굵은 글씨로 표시
     - 장바구니 내 모든 아이템의 합계 금액
  4. **주문하기 버튼**: 총 금액 아래에 위치한 회색 버튼 ("주문하기" 텍스트)

### 4.3 기능 요구사항

#### 4.3.1 메뉴 조회
- 서버에서 메뉴 목록을 조회하여 화면에 표시
- 각 메뉴는 이미지, 이름, 가격, 설명, 옵션 정보를 포함

#### 4.3.2 옵션 선택
- 사용자는 각 메뉴의 옵션을 체크박스로 선택/해제 가능
- 옵션 선택 시 추가 가격이 반영됨
- 여러 옵션을 동시에 선택 가능

#### 4.3.3 장바구니 기능
- **담기**: 메뉴 카드의 "담기" 버튼 클릭 시 장바구니에 추가
  - 선택된 옵션이 있으면 함께 저장
  - 동일한 메뉴와 옵션 조합이 이미 장바구니에 있으면 수량 증가
  - 다른 옵션 조합이면 별도 아이템으로 추가
- **수량 표시**: 각 아이템의 수량을 표시
- **가격 계산**: 
  - 각 아이템의 가격 = (기본 가격 + 선택된 옵션 가격 합계) × 수량
  - 총 금액 = 모든 아이템 가격의 합계
- **실시간 업데이트**: 장바구니에 아이템이 추가되면 즉시 화면에 반영

#### 4.3.4 주문하기
- 장바구니에 아이템이 있을 때만 "주문하기" 버튼 활성화
- "주문하기" 버튼 클릭 시:
  - 장바구니의 모든 아이템을 주문으로 전송
  - 주문 성공 시 장바구니 초기화
  - 주문 완료 메시지 표시 (선택 사항)

#### 4.3.5 화면 이동
- "관리자" 버튼 클릭 시 관리자 화면으로 이동

### 4.4 사용자 플로우

1. 사용자가 주문하기 화면에 진입
2. 메뉴 목록이 화면에 표시됨
3. 사용자가 원하는 메뉴를 선택
4. 필요시 옵션을 선택 (샷 추가, 시럽 추가 등)
5. "담기" 버튼 클릭하여 장바구니에 추가
6. 장바구니에 추가된 아이템 확인 및 총 금액 확인
7. 추가 주문이 있으면 3-5번 반복
8. "주문하기" 버튼 클릭하여 주문 완료

### 4.5 UI/UX 요구사항

#### 4.5.1 디자인
- 깔끔하고 미니멀한 디자인
- 흰색 배경에 다크 그레이 텍스트와 아웃라인
- "COZY" 로고는 다크 그린 배경 사용
- 버튼은 회색 계열 사용

#### 4.5.2 반응형
- 메뉴 카드는 화면 크기에 따라 가로 배치 개수 조정
- 모바일에서는 세로 배치로 변경 가능

#### 4.5.3 사용성
- 버튼 클릭 시 명확한 피드백 제공
- 장바구니가 비어있을 때 적절한 안내 메시지 표시
- 가격 정보는 천 단위 구분 기호(쉼표) 사용
- 옵션 선택 상태가 명확하게 표시됨

### 4.6 데이터 구조

#### 4.6.1 메뉴 데이터
```javascript
{
  id: number,
  name: string,
  price: number,
  description: string,
  image: string,
  options: [
    {
      id: number,
      name: string,
      price: number
    }
  ]
}
```

#### 4.6.2 장바구니 아이템 데이터
```javascript
{
  menuId: number,
  menuName: string,
  basePrice: number,
  selectedOptions: [
    {
      optionId: number,
      optionName: string,
      optionPrice: number
    }
  ],
  quantity: number,
  totalPrice: number
}
```

#### 4.6.3 주문 데이터
```javascript
{
  items: [
    {
      menuId: number,
      menuName: string,
      basePrice: number,
      selectedOptions: Array,
      quantity: number,
      totalPrice: number
    }
  ],
  totalAmount: number,
  orderDate: Date
}
```

## 5. 관리자 화면 PRD

### 5.1 화면 개요
관리자가 주문을 관리하고 재고를 조정할 수 있는 관리자 전용 화면입니다.

### 5.2 화면 구성

#### 5.2.1 헤더 영역
- **위치**: 화면 상단
- **구성 요소**:
  - **로고**: 왼쪽에 "COZY" 텍스트가 들어간 다크 그린 배경의 박스
  - **주문하기 버튼**: 로고 오른쪽에 위치 (주문하기 화면으로 이동)
  - **관리자 버튼**: 주문하기 버튼 오른쪽에 위치 (현재 화면이므로 활성화 상태, 다크 테두리로 표시)

#### 5.2.2 관리자 대시보드 영역
- **위치**: 헤더 아래, 화면 상단
- **레이아웃**: 연한 회색 테두리 박스로 구분
- **구성 요소**:
  1. **제목**: "관리자 대시보드" 텍스트
  2. **주문 통계 요약**:
     - 형식: "총 주문 X / 주문 접수 X / 제조 중 X / 제조 완료 X"
     - 각 상태별 주문 개수를 한 줄로 표시
     - 실시간으로 업데이트됨

#### 5.2.3 재고 현황 영역
- **위치**: 관리자 대시보드 아래
- **레이아웃**: 연한 회색 테두리 박스로 구분
- **구성 요소**:
  1. **제목**: "재고 현황" 텍스트
  2. **재고 카드 목록**:
     - 메뉴별로 카드를 가로로 배치
     - 각 카드 구성:
       - **메뉴명**: 카드 상단에 표시 (예: "아메리카노 (ICE)", "아메리카노 (HOT)", "카페라떼")
       - **재고 수량**: 메뉴명 아래에 표시 (예: "10개")
       - **수량 조정 버튼**: 카드 하단에 "+" 버튼과 "-" 버튼 배치

#### 5.2.4 주문 현황 영역
- **위치**: 재고 현황 아래, 화면 하단
- **레이아웃**: 연한 회색 테두리 박스로 구분
- **구성 요소**:
  1. **제목**: "주문 현황" 텍스트
  2. **주문 목록**:
     - 각 주문은 하나의 행으로 표시
     - 주문 정보 구성:
       - **주문 시간**: 왼쪽에 표시 (예: "7월 31일 13:00")
       - **주문 내역**: 주문 시간 옆에 표시 (예: "아메리카노(ICE) x 1")
       - **주문 금액**: 주문 내역 옆에 표시 (예: "4,000원")
       - **액션 버튼**: 오른쪽에 위치 (예: "주문 접수" 버튼)
     - 주문이 여러 개일 경우 세로로 나열

### 5.3 기능 요구사항

#### 5.3.1 대시보드 통계 조회
- 서버에서 주문 통계를 조회하여 실시간으로 표시
- 통계 항목:
  - **총 주문**: 전체 주문 개수
  - **주문 접수**: 접수된 주문 개수
  - **제조 중**: 현재 제조 중인 주문 개수
  - **제조 완료**: 제조가 완료된 주문 개수
- 주문 상태가 변경될 때마다 자동으로 업데이트

#### 5.3.2 재고 관리
- **재고 조회**: 서버에서 각 메뉴의 현재 재고 수량을 조회하여 표시
- **재고 증가**: "+" 버튼 클릭 시 해당 메뉴의 재고 수량 1 증가
- **재고 감소**: "-" 버튼 클릭 시 해당 메뉴의 재고 수량 1 감소
- **재고 업데이트**: 재고 변경 시 즉시 서버에 반영하고 화면에 업데이트
- **재고 제한**: 재고가 0일 때 "-" 버튼 비활성화 (선택 사항)

#### 5.3.3 주문 현황 관리
- **주문 목록 조회**: 서버에서 주문 목록을 조회하여 표시
  - 주문 시간순으로 정렬 (최신 주문이 위에 표시)
  - 각 주문의 상세 정보 표시
- **주문 상태 변경**:
  - "주문 접수" 버튼 클릭 시 주문 상태를 "주문 접수"로 변경
  - 주문 상태에 따라 버튼 텍스트 변경 가능 (예: "제조 중", "제조 완료")
- **주문 상세 정보 표시**:
  - 주문 시간, 주문 내역(메뉴명, 수량), 주문 금액 표시
  - 옵션이 있는 경우 옵션 정보도 표시 (선택 사항)

#### 5.3.4 화면 이동
- "주문하기" 버튼 클릭 시 주문하기 화면으로 이동

### 5.4 사용자 플로우

#### 5.4.1 재고 관리 플로우
1. 관리자가 관리자 화면에 진입
2. 재고 현황 영역에서 각 메뉴의 현재 재고 확인
3. 재고를 조정해야 할 경우:
   - 재고 증가: "+" 버튼 클릭
   - 재고 감소: "-" 버튼 클릭
4. 변경된 재고가 즉시 화면에 반영됨

#### 5.4.2 주문 처리 플로우
1. 관리자가 관리자 화면에 진입
2. 관리자 대시보드에서 전체 주문 통계 확인
3. 주문 현황 영역에서 새로운 주문 확인
4. "주문 접수" 버튼 클릭하여 주문 접수
5. 주문 상태에 따라 추가 액션 수행 (제조 중, 제조 완료 등)
6. 대시보드 통계가 자동으로 업데이트됨

### 5.5 UI/UX 요구사항

#### 5.5.1 디자인
- 주문하기 화면과 일관된 디자인 스타일 유지
- 깔끔하고 미니멀한 디자인
- 흰색 배경에 다크 그레이 텍스트와 아웃라인
- 각 섹션은 연한 회색 테두리로 구분
- 활성화된 버튼은 다크 테두리로 표시

#### 5.5.2 반응형
- 재고 카드는 화면 크기에 따라 가로 배치 개수 조정
- 모바일에서는 세로 배치로 변경 가능
- 주문 목록은 화면 크기에 따라 레이아웃 조정

#### 5.5.3 사용성
- 버튼 클릭 시 명확한 피드백 제공
- 재고 수량 변경 시 즉시 화면에 반영
- 주문 상태 변경 시 대시보드 통계 자동 업데이트
- 주문이 없을 때 적절한 안내 메시지 표시
- 가격 정보는 천 단위 구분 기호(쉼표) 사용

#### 5.5.4 실시간 업데이트
- 새로운 주문이 들어오면 주문 현황에 자동으로 추가
- 주문 상태 변경 시 대시보드 통계 자동 갱신
- 주기적인 폴링 또는 실시간 업데이트 방식 사용 (선택 사항)

### 5.6 데이터 구조

#### 5.6.1 재고 데이터
```javascript
{
  menuId: number,
  menuName: string,
  stock: number
}
```

#### 5.6.2 주문 상태 데이터
```javascript
{
  orderId: number,
  orderDate: Date,
  items: [
    {
      menuId: number,
      menuName: string,
      quantity: number,
      price: number,
      selectedOptions: Array
    }
  ],
  totalAmount: number,
  status: 'pending' | 'received' | 'preparing' | 'completed'
}
```

#### 5.6.3 대시보드 통계 데이터
```javascript
{
  totalOrders: number,
  receivedOrders: number,
  preparingOrders: number,
  completedOrders: number
}
```

### 5.7 주문 상태 관리

#### 5.7.1 주문 상태 정의
- **pending**: 주문 대기 (주문이 생성되었지만 아직 접수되지 않음)
- **received**: 주문 접수 (관리자가 주문을 접수함)
- **preparing**: 제조 중 (현재 제조 중인 상태)
- **completed**: 제조 완료 (제조가 완료되어 제공 가능한 상태)

#### 5.7.2 상태 변경 플로우
1. 사용자가 주문하면 상태는 "pending"
2. 관리자가 "주문 접수" 버튼 클릭 시 "received"로 변경
3. 관리자가 "제조 중" 버튼 클릭 시 "preparing"로 변경 (선택 사항)
4. 관리자가 "제조 완료" 버튼 클릭 시 "completed"로 변경 (선택 사항)

## 6. 백엔드 개발 PRD

### 6.1 데이터 모델

#### 6.1.1 Menus (메뉴)
커피 메뉴 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key): 메뉴 고유 ID (자동 증가)
- `name` (VARCHAR): 커피 이름 (예: "아메리카노(ICE)", "카페라떼")
- `description` (TEXT): 메뉴 설명 (예: "시원한 아이스 아메리카노")
- `price` (INTEGER): 기본 가격 (원 단위)
- `image` (VARCHAR): 이미지 파일 경로 또는 URL
- `stock` (INTEGER): 재고 수량 (기본값: 0)
- `created_at` (TIMESTAMP): 생성 일시
- `updated_at` (TIMESTAMP): 수정 일시

**예시 데이터:**
```sql
INSERT INTO menus (name, description, price, image, stock) VALUES
('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, '/americano-ice.jpg', 10),
('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, '/americano-hot.jpg', 8),
('카페라떼', '부드러운 카페라떼', 5000, '/caffe-latte.jpg', 5);
```

#### 6.1.2 Options (옵션)
메뉴에 추가할 수 있는 옵션 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key): 옵션 고유 ID (자동 증가)
- `name` (VARCHAR): 옵션 이름 (예: "샷 추가", "시럽 추가")
- `price` (INTEGER): 옵션 추가 가격 (원 단위, 0 이상)
- `menu_id` (Foreign Key): 연결된 메뉴 ID (Menus 테이블 참조)
- `created_at` (TIMESTAMP): 생성 일시
- `updated_at` (TIMESTAMP): 수정 일시

**예시 데이터:**
```sql
INSERT INTO options (name, price, menu_id) VALUES
('샷 추가', 500, 1),
('시럽 추가', 0, 1),
('샷 추가', 500, 2),
('시럽 추가', 0, 2);
```

#### 6.1.3 Orders (주문)
주문 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key): 주문 고유 ID (자동 증가)
- `order_date` (TIMESTAMP): 주문 일시
- `status` (VARCHAR): 주문 상태 ('pending', 'received', 'preparing', 'completed')
- `total_amount` (INTEGER): 총 주문 금액 (원 단위)
- `created_at` (TIMESTAMP): 생성 일시
- `updated_at` (TIMESTAMP): 수정 일시

**예시 데이터:**
```sql
INSERT INTO orders (order_date, status, total_amount) VALUES
('2024-01-15 13:00:00', 'pending', 12500);
```

#### 6.1.4 OrderItems (주문 항목)
주문에 포함된 각 메뉴 항목 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key): 주문 항목 고유 ID (자동 증가)
- `order_id` (Foreign Key): 주문 ID (Orders 테이블 참조)
- `menu_id` (Foreign Key): 메뉴 ID (Menus 테이블 참조)
- `quantity` (INTEGER): 주문 수량
- `base_price` (INTEGER): 메뉴 기본 가격 (주문 시점의 가격)
- `item_total_price` (INTEGER): 해당 항목의 총 가격 (기본 가격 + 옵션 가격) × 수량
- `created_at` (TIMESTAMP): 생성 일시

**예시 데이터:**
```sql
INSERT INTO order_items (order_id, menu_id, quantity, base_price, item_total_price) VALUES
(1, 1, 1, 4000, 4500),
(1, 2, 2, 4000, 8000);
```

#### 6.1.5 OrderItemOptions (주문 항목 옵션)
주문 항목에 선택된 옵션 정보를 저장하는 테이블입니다.

**필드:**
- `id` (Primary Key): 주문 항목 옵션 고유 ID (자동 증가)
- `order_item_id` (Foreign Key): 주문 항목 ID (OrderItems 테이블 참조)
- `option_id` (Foreign Key): 옵션 ID (Options 테이블 참조)
- `option_price` (INTEGER): 옵션 가격 (주문 시점의 가격)
- `created_at` (TIMESTAMP): 생성 일시

**예시 데이터:**
```sql
INSERT INTO order_item_options (order_item_id, option_id, option_price) VALUES
(1, 1, 500);  -- 아메리카노(ICE)에 샷 추가 옵션
```

### 6.2 데이터 스키마를 위한 사용자 흐름

#### 6.2.1 메뉴 조회 및 표시
1. **프런트엔드**: '주문하기' 화면 진입 시 메뉴 목록 조회 요청
2. **백엔드**: `GET /api/menus` API 호출
3. **데이터베이스**: Menus 테이블에서 모든 메뉴 정보 조회
   - Options 테이블과 JOIN하여 각 메뉴의 옵션 정보도 함께 조회
4. **백엔드**: 메뉴 목록과 옵션 정보를 JSON 형태로 반환
5. **프런트엔드**: 받은 데이터를 화면에 표시
   - 일반 사용자 화면: 재고 수량 정보는 제외하고 표시
   - 관리자 화면: 재고 수량 정보도 함께 표시

#### 6.2.2 장바구니 관리 (프런트엔드)
1. 사용자가 메뉴를 선택하고 옵션을 선택
2. "담기" 버튼 클릭 시 프런트엔드에서 장바구니 상태에 저장
3. 장바구니 정보는 프런트엔드 상태로만 관리 (서버 전송 전까지)

#### 6.2.3 주문 생성
1. **프런트엔드**: 장바구니에서 "주문하기" 버튼 클릭
2. **백엔드**: `POST /api/orders` API 호출
   - 요청 본문에 주문 정보 포함:
     - 주문 항목 목록 (메뉴 ID, 수량, 선택된 옵션)
     - 총 금액
3. **데이터베이스 처리**:
   - Orders 테이블에 주문 정보 저장 (status: 'pending')
   - OrderItems 테이블에 각 주문 항목 저장
   - OrderItemOptions 테이블에 선택된 옵션 정보 저장
   - Menus 테이블의 재고 수량 차감 (stock = stock - quantity)
4. **백엔드**: 주문 ID와 함께 성공 응답 반환
5. **프런트엔드**: 주문 성공 시 장바구니 초기화

#### 6.2.4 주문 현황 조회
1. **프런트엔드**: 관리자 화면의 '주문 현황' 영역에서 주문 목록 조회 요청
2. **백엔드**: `GET /api/orders` API 호출
   - 쿼리 파라미터로 상태 필터링 가능 (예: `?status=pending,received,preparing`)
3. **데이터베이스**: Orders 테이블에서 주문 목록 조회
   - OrderItems와 JOIN하여 주문 항목 정보 조회
   - OrderItemOptions와 JOIN하여 옵션 정보 조회
   - Menus와 JOIN하여 메뉴 이름 등 상세 정보 조회
   - 주문 일시 기준 내림차순 정렬
4. **백엔드**: 주문 목록을 JSON 형태로 반환
5. **프런트엔드**: 받은 데이터를 화면에 표시

#### 6.2.5 주문 상태 변경
1. **프런트엔드**: 관리자가 주문 상태 변경 버튼 클릭
   - '주문 접수' → 'received'
   - '제조 시작' → 'preparing'
   - '제조 완료' → 'completed'
2. **백엔드**: `PATCH /api/orders/:orderId/status` API 호출
   - 요청 본문에 새로운 상태 값 포함
3. **데이터베이스**: Orders 테이블에서 해당 주문의 status 필드 업데이트
4. **백엔드**: 업데이트 성공 응답 반환
5. **프런트엔드**: 주문 현황 화면 자동 새로고침 또는 상태 업데이트

### 6.3 API 설계

#### 6.3.1 메뉴 관련 API

##### GET /api/menus
메뉴 목록을 조회합니다.

**요청:**
- Method: GET
- Headers: 없음
- Query Parameters:
  - `include_stock` (optional, boolean): 재고 정보 포함 여부 (기본값: false)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "description": "시원한 아이스 아메리카노",
      "price": 4000,
      "image": "/americano-ice.jpg",
      "stock": 10,
      "options": [
        {
          "id": 1,
          "name": "샷 추가",
          "price": 500
        },
        {
          "id": 2,
          "name": "시럽 추가",
          "price": 0
        }
      ]
    }
  ]
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": "메뉴 조회 중 오류가 발생했습니다."
}
```

##### GET /api/menus/:menuId
특정 메뉴의 상세 정보를 조회합니다.

**요청:**
- Method: GET
- Path Parameters:
  - `menuId`: 메뉴 ID

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "아메리카노(ICE)",
    "description": "시원한 아이스 아메리카노",
    "price": 4000,
    "image": "/americano-ice.jpg",
    "stock": 10,
    "options": [...]
  }
}
```

##### PATCH /api/menus/:menuId/stock
메뉴의 재고 수량을 수정합니다. (관리자 전용)

**요청:**
- Method: PATCH
- Path Parameters:
  - `menuId`: 메뉴 ID
- Body:
```json
{
  "delta": 1  // 증가: 양수, 감소: 음수
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "stock": 11
  }
}
```

#### 6.3.2 주문 관련 API

##### POST /api/orders
새로운 주문을 생성합니다.

**요청:**
- Method: POST
- Body:
```json
{
  "items": [
    {
      "menuId": 1,
      "quantity": 1,
      "selectedOptionIds": [1, 2]
    },
    {
      "menuId": 2,
      "quantity": 2,
      "selectedOptionIds": []
    }
  ]
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderDate": "2024-01-15T13:00:00Z",
    "status": "pending",
    "totalAmount": 12500,
    "items": [
      {
        "menuId": 1,
        "menuName": "아메리카노(ICE)",
        "quantity": 1,
        "basePrice": 4000,
        "selectedOptions": [
          {
            "optionId": 1,
            "optionName": "샷 추가",
            "optionPrice": 500
          }
        ],
        "itemTotalPrice": 4500
      }
    ]
  }
}
```

**에러 응답 (재고 부족):**
```json
{
  "success": false,
  "error": "재고가 부족합니다.",
  "details": [
    {
      "menuId": 1,
      "menuName": "아메리카노(ICE)",
      "availableStock": 0,
      "requestedQuantity": 1
    }
  ]
}
```

##### GET /api/orders
주문 목록을 조회합니다.

**요청:**
- Method: GET
- Query Parameters:
  - `status` (optional, string): 주문 상태 필터 (쉼표로 구분, 예: "pending,received,preparing")
  - `limit` (optional, number): 조회할 최대 개수 (기본값: 50)
  - `offset` (optional, number): 건너뛸 개수 (기본값: 0)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderDate": "2024-01-15T13:00:00Z",
      "status": "pending",
      "totalAmount": 12500,
      "items": [
        {
          "menuId": 1,
          "menuName": "아메리카노(ICE)",
          "quantity": 1,
          "basePrice": 4000,
          "selectedOptions": [...],
          "itemTotalPrice": 4500
        }
      ]
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0
  }
}
```

##### GET /api/orders/:orderId
특정 주문의 상세 정보를 조회합니다.

**요청:**
- Method: GET
- Path Parameters:
  - `orderId`: 주문 ID

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderDate": "2024-01-15T13:00:00Z",
    "status": "pending",
    "totalAmount": 12500,
    "items": [...]
  }
}
```

##### PATCH /api/orders/:orderId/status
주문 상태를 변경합니다. (관리자 전용)

**요청:**
- Method: PATCH
- Path Parameters:
  - `orderId`: 주문 ID
- Body:
```json
{
  "status": "received"  // "pending" | "received" | "preparing" | "completed"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "received"
  }
}
```

#### 6.3.3 통계 관련 API

##### GET /api/orders/stats
주문 통계 정보를 조회합니다. (관리자 전용)

**요청:**
- Method: GET

**응답:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 10,
    "receivedOrders": 3,
    "preparingOrders": 2,
    "completedOrders": 5
  }
}
```

### 6.4 데이터베이스 스키마 설계

#### 6.4.1 ERD (Entity Relationship Diagram)
```
Menus (1) ──< (N) Options
Menus (1) ──< (N) OrderItems
Orders (1) ──< (N) OrderItems
OrderItems (1) ──< (N) OrderItemOptions
Options (1) ──< (N) OrderItemOptions
```

#### 6.4.2 테이블 생성 SQL

```sql
-- Menus 테이블
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image VARCHAR(255),
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Options 테이블
CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price INTEGER DEFAULT 0,
  menu_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);

-- Orders 테이블
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('pending', 'received', 'preparing', 'completed'))
);

-- OrderItems 테이블
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  menu_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  base_price INTEGER NOT NULL,
  item_total_price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id)
);

-- OrderItemOptions 테이블
CREATE TABLE order_item_options (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL,
  option_id INTEGER NOT NULL,
  option_price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES options(id)
);

-- 인덱스 생성
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_options_menu_id ON options(menu_id);
```

### 6.5 비즈니스 로직

#### 6.5.1 주문 생성 시 재고 검증
1. 주문 요청이 들어오면 각 주문 항목의 재고를 확인
2. 재고가 부족한 항목이 있으면 주문 실패 및 에러 메시지 반환
3. 모든 항목의 재고가 충분하면 주문 생성 및 재고 차감
4. 재고 차감은 트랜잭션으로 처리하여 데이터 일관성 보장

#### 6.5.2 주문 상태 변경 규칙
- 상태 변경은 순차적으로만 가능:
  - `pending` → `received` → `preparing` → `completed`
- 이전 상태로 되돌리는 것은 불가능
- 상태 변경 시 `updated_at` 필드 자동 업데이트

#### 6.5.3 재고 관리
- 재고는 0 이상의 값만 허용
- 주문 생성 시 재고 차감
- 관리자가 수동으로 재고 조정 가능
- 재고가 0이 되면 해당 메뉴는 주문 불가 (프런트엔드에서 처리)