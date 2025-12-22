import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// POST /api/orders - 주문 생성
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: '주문 항목이 필요합니다.'
      });
    }
    
    // 재고 확인 및 주문 총액 계산
    let totalAmount = 0;
    const insufficientStock = [];
    const orderItemsData = [];
    
    for (const item of items) {
      const { menuId, quantity, selectedOptionIds = [] } = item;
      
      // 메뉴 정보 조회
      const menuQuery = 'SELECT * FROM menus WHERE id = $1';
      const menuResult = await client.query(menuQuery, [menuId]);
      
      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `메뉴 ID ${menuId}를 찾을 수 없습니다.`
        });
      }
      
      const menu = menuResult.rows[0];
      
      // 재고 확인
      if (menu.stock < quantity) {
        insufficientStock.push({
          menuId: menu.id,
          menuName: menu.name,
          availableStock: menu.stock,
          requestedQuantity: quantity
        });
        continue;
      }
      
      // 옵션 정보 조회
      let optionTotalPrice = 0;
      const selectedOptions = [];
      
      if (selectedOptionIds.length > 0) {
        const optionsQuery = 'SELECT * FROM options WHERE id = ANY($1::int[]) AND menu_id = $2';
        const optionsResult = await client.query(optionsQuery, [selectedOptionIds, menuId]);
        
        for (const option of optionsResult.rows) {
          optionTotalPrice += option.price;
          selectedOptions.push({
            optionId: option.id,
            optionName: option.name,
            optionPrice: option.price
          });
        }
      }
      
      const itemTotalPrice = (menu.price + optionTotalPrice) * quantity;
      totalAmount += itemTotalPrice;
      
      orderItemsData.push({
        menu,
        quantity,
        basePrice: menu.price,
        itemTotalPrice,
        selectedOptions
      });
    }
    
    // 재고 부족 항목이 있으면 주문 실패
    if (insufficientStock.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: '재고가 부족합니다.',
        details: insufficientStock
      });
    }
    
    // 주문 생성
    const orderQuery = `
      INSERT INTO orders (order_date, status, total_amount)
      VALUES (CURRENT_TIMESTAMP, 'pending', $1)
      RETURNING id, order_date, status, total_amount
    `;
    const orderResult = await client.query(orderQuery, [totalAmount]);
    const order = orderResult.rows[0];
    
    // 주문 항목 및 옵션 저장
    const orderItems = [];
    for (const itemData of orderItemsData) {
      // 재고 차감
      const updateStockQuery = 'UPDATE menus SET stock = stock - $1 WHERE id = $2';
      await client.query(updateStockQuery, [itemData.quantity, itemData.menu.id]);
      
      // 주문 항목 저장
      const orderItemQuery = `
        INSERT INTO order_items (order_id, menu_id, quantity, base_price, item_total_price)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      const orderItemResult = await client.query(orderItemQuery, [
        order.id,
        itemData.menu.id,
        itemData.quantity,
        itemData.basePrice,
        itemData.itemTotalPrice
      ]);
      
      const orderItemId = orderItemResult.rows[0].id;
      
      // 주문 항목 옵션 저장
      for (const option of itemData.selectedOptions) {
        const optionQuery = `
          INSERT INTO order_item_options (order_item_id, option_id, option_price)
          VALUES ($1, $2, $3)
        `;
        await client.query(optionQuery, [orderItemId, option.optionId, option.optionPrice]);
      }
      
      orderItems.push({
        menuId: itemData.menu.id,
        menuName: itemData.menu.name,
        quantity: itemData.quantity,
        basePrice: itemData.basePrice,
        selectedOptions: itemData.selectedOptions,
        itemTotalPrice: itemData.itemTotalPrice
      });
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.total_amount,
        items: orderItems
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('주문 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 생성 중 오류가 발생했습니다.'
    });
  } finally {
    client.release();
  }
});

// GET /api/orders - 주문 목록 조회
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT o.*, 
        COUNT(DISTINCT oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    const queryParams = [];
    
    if (status) {
      const statusList = status.split(',').map(s => s.trim());
      query += ` WHERE o.status = ANY($1::varchar[])`;
      queryParams.push(statusList);
    }
    
    query += ` GROUP BY o.id ORDER BY o.order_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const ordersResult = await pool.query(query, queryParams);
    
    // 각 주문의 상세 정보 조회
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        // 주문 항목 조회
        const itemsQuery = `
          SELECT oi.*, m.name as menu_name
          FROM order_items oi
          JOIN menus m ON oi.menu_id = m.id
          WHERE oi.order_id = $1
        `;
        const itemsResult = await pool.query(itemsQuery, [order.id]);
        
        // 각 항목의 옵션 조회
        const items = await Promise.all(
          itemsResult.rows.map(async (item) => {
            const optionsQuery = `
              SELECT oio.option_id, oio.option_price, opt.name as option_name
              FROM order_item_options oio
              JOIN options opt ON oio.option_id = opt.id
              WHERE oio.order_item_id = $1
            `;
            const optionsResult = await pool.query(optionsQuery, [item.id]);
            
            return {
              menuId: item.menu_id,
              menuName: item.menu_name,
              quantity: item.quantity,
              basePrice: item.base_price,
              selectedOptions: optionsResult.rows.map(opt => ({
                optionId: opt.option_id,
                optionName: opt.option_name,
                optionPrice: opt.option_price
              })),
              itemTotalPrice: item.item_total_price
            };
          })
        );
        
        return {
          id: order.id,
          orderDate: order.order_date,
          status: order.status,
          totalAmount: order.total_amount,
          items
        };
      })
    );
    
    // 전체 개수 조회
    let countQuery = 'SELECT COUNT(*) FROM orders';
    if (status) {
      const statusList = status.split(',').map(s => s.trim());
      countQuery += ` WHERE status = ANY($1::varchar[])`;
      var countResult = await pool.query(countQuery, [statusList]);
    } else {
      var countResult = await pool.query(countQuery);
    }
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/orders/:orderId - 특정 주문 조회
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 주문 조회
    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const orderResult = await pool.query(orderQuery, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      });
    }
    
    const order = orderResult.rows[0];
    
    // 주문 항목 조회
    const itemsQuery = `
      SELECT oi.*, m.name as menu_name
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await pool.query(itemsQuery, [orderId]);
    
    // 각 항목의 옵션 조회
    const items = await Promise.all(
      itemsResult.rows.map(async (item) => {
        const optionsQuery = `
          SELECT oio.option_id, oio.option_price, opt.name as option_name
          FROM order_item_options oio
          JOIN options opt ON oio.option_id = opt.id
          WHERE oio.order_item_id = $1
        `;
        const optionsResult = await pool.query(optionsQuery, [item.id]);
        
        return {
          menuId: item.menu_id,
          menuName: item.menu_name,
          quantity: item.quantity,
          basePrice: item.base_price,
          selectedOptions: optionsResult.rows.map(opt => ({
            optionId: opt.option_id,
            optionName: opt.option_name,
            optionPrice: opt.option_price
          })),
          itemTotalPrice: item.item_total_price
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        id: order.id,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.total_amount,
        items
      }
    });
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 조회 중 오류가 발생했습니다.'
    });
  }
});

// PATCH /api/orders/:orderId/status - 주문 상태 변경
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'received', 'preparing', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `유효하지 않은 상태입니다. 가능한 값: ${validStatuses.join(', ')}`
      });
    }
    
    // 주문 존재 확인
    const checkQuery = 'SELECT id FROM orders WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [orderId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      });
    }
    
    // 상태 업데이트
    const updateQuery = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status';
    const updateResult = await pool.query(updateQuery, [status, orderId]);
    
    res.json({
      success: true,
      data: {
        id: updateResult.rows[0].id,
        status: updateResult.rows[0].status
      }
    });
  } catch (error) {
    console.error('주문 상태 변경 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 상태 변경 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/orders/stats - 주문 통계 조회
router.get('/stats/all', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'received') as received_orders,
        COUNT(*) FILTER (WHERE status = 'preparing') as preparing_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders
      FROM orders
    `;
    const statsResult = await pool.query(statsQuery);
    
    const stats = statsResult.rows[0];
    
    res.json({
      success: true,
      data: {
        totalOrders: parseInt(stats.total_orders),
        receivedOrders: parseInt(stats.received_orders),
        preparingOrders: parseInt(stats.preparing_orders),
        completedOrders: parseInt(stats.completed_orders)
      }
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '통계 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;

