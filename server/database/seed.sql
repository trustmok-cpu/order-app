-- 초기 데이터 삽입 스크립트

-- 기존 데이터 삭제 (초기화 시)
-- DELETE FROM order_item_options;
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM options;
-- DELETE FROM menus;

-- 메뉴 데이터 삽입 (중복 방지를 위해 NOT EXISTS 사용)
INSERT INTO menus (name, description, price, image, stock)
SELECT * FROM (VALUES
  ('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, '/americano-ice.jpg', 10),
  ('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, '/americano-hot.jpg', 8),
  ('카페라떼', '부드러운 카페라떼', 5000, '/caffe-latte.jpg', 5),
  ('카푸치노', '우유 거품이 풍부한 카푸치노', 5500, '', 7),
  ('바닐라라떼', '달콤한 바닐라라떼', 5500, '', 6),
  ('에스프레소', '진한 에스프레소', 3500, '', 9)
) AS v(name, description, price, image, stock)
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE menus.name = v.name);

-- 옵션 데이터 삽입 (각 메뉴마다 샷 추가, 시럽 추가 옵션)
-- 메뉴 ID를 동적으로 가져와서 삽입
INSERT INTO options (name, price, menu_id)
SELECT * FROM (VALUES
  ('샷 추가', 500, (SELECT id FROM menus WHERE name = '아메리카노(ICE)')),
  ('시럽 추가', 0, (SELECT id FROM menus WHERE name = '아메리카노(ICE)')),
  ('샷 추가', 500, (SELECT id FROM menus WHERE name = '아메리카노(HOT)')),
  ('시럽 추가', 0, (SELECT id FROM menus WHERE name = '아메리카노(HOT)')),
  ('샷 추가', 500, (SELECT id FROM menus WHERE name = '카페라떼')),
  ('시럽 추가', 0, (SELECT id FROM menus WHERE name = '카페라떼')),
  ('샷 추가', 500, (SELECT id FROM menus WHERE name = '카푸치노')),
  ('시럽 추가', 0, (SELECT id FROM menus WHERE name = '카푸치노')),
  ('샷 추가', 500, (SELECT id FROM menus WHERE name = '바닐라라떼')),
  ('시럽 추가', 0, (SELECT id FROM menus WHERE name = '바닐라라떼')),
  ('샷 추가', 500, (SELECT id FROM menus WHERE name = '에스프레소')),
  ('시럽 추가', 0, (SELECT id FROM menus WHERE name = '에스프레소'))
) AS v(name, price, menu_id)
WHERE v.menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM options 
    WHERE options.name = v.name 
    AND options.menu_id = v.menu_id
  );

