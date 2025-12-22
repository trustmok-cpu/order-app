import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/menus - 메뉴 목록 조회
router.get('/', async (req, res) => {
  try {
    const includeStock = req.query.include_stock === 'true';
    
    // 메뉴 조회
    const menusQuery = 'SELECT * FROM menus ORDER BY id';
    const menusResult = await pool.query(menusQuery);
    
    // 각 메뉴의 옵션 조회
    const menus = await Promise.all(
      menusResult.rows.map(async (menu) => {
        const optionsQuery = 'SELECT id, name, price FROM options WHERE menu_id = $1';
        const optionsResult = await pool.query(optionsQuery, [menu.id]);
        
        const menuData = {
          id: menu.id,
          name: menu.name,
          description: menu.description,
          price: menu.price,
          image: menu.image,
          stock: menu.stock, // 항상 재고 정보 포함
          options: optionsResult.rows
        };
        
        return menuData;
      })
    );
    
    res.json({
      success: true,
      data: menus
    });
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '메뉴 조회 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/menus/:menuId - 특정 메뉴 조회
router.get('/:menuId', async (req, res) => {
  try {
    const { menuId } = req.params;
    
    // 메뉴 조회
    const menuQuery = 'SELECT * FROM menus WHERE id = $1';
    const menuResult = await pool.query(menuQuery, [menuId]);
    
    if (menuResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.'
      });
    }
    
    const menu = menuResult.rows[0];
    
    // 옵션 조회
    const optionsQuery = 'SELECT id, name, price FROM options WHERE menu_id = $1';
    const optionsResult = await pool.query(optionsQuery, [menuId]);
    
    res.json({
      success: true,
      data: {
        id: menu.id,
        name: menu.name,
        description: menu.description,
        price: menu.price,
        image: menu.image,
        stock: menu.stock,
        options: optionsResult.rows
      }
    });
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '메뉴 조회 중 오류가 발생했습니다.'
    });
  }
});

// PATCH /api/menus/:menuId/stock - 메뉴 재고 수정
router.patch('/:menuId/stock', async (req, res) => {
  try {
    const { menuId } = req.params;
    const { delta } = req.body;
    
    if (typeof delta !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'delta는 숫자여야 합니다.'
      });
    }
    
    // 현재 재고 조회
    const currentQuery = 'SELECT stock FROM menus WHERE id = $1';
    const currentResult = await pool.query(currentQuery, [menuId]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.'
      });
    }
    
    const currentStock = currentResult.rows[0].stock;
    const newStock = Math.max(0, currentStock + delta);
    
    // 재고 업데이트
    const updateQuery = 'UPDATE menus SET stock = $1 WHERE id = $2 RETURNING id, stock';
    const updateResult = await pool.query(updateQuery, [newStock, menuId]);
    
    res.json({
      success: true,
      data: {
        id: parseInt(menuId),
        stock: updateResult.rows[0].stock
      }
    });
  } catch (error) {
    console.error('재고 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '재고 수정 중 오류가 발생했습니다.'
    });
  }
});

export default router;

