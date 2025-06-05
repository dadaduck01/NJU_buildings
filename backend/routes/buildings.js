const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// 数据库连接
const dbPath = path.join(__dirname, '../database/buildings.db');
const db = new sqlite3.Database(dbPath);

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    // 检查文件类型
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 获取所有建筑信息
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM buildings ORDER BY name';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('查询建筑信息失败:', err.message);
      res.status(500).json({ error: '获取建筑信息失败' });
      return;
    }
    res.json({
      success: true,
      data: rows
    });
  });
});

// 根据ID获取单个建筑信息
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM buildings WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('查询建筑信息失败:', err.message);
      res.status(500).json({ error: '获取建筑信息失败' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: '建筑信息不存在' });
      return;
    }
    
    res.json({
      success: true,
      data: row
    });
  });
});

// 根据建筑名称搜索
router.get('/search/:name', (req, res) => {
  const { name } = req.params;
  const sql = 'SELECT * FROM buildings WHERE name LIKE ? ORDER BY name';
  
  db.all(sql, [`%${name}%`], (err, rows) => {
    if (err) {
      console.error('搜索建筑失败:', err.message);
      res.status(500).json({ error: '搜索建筑失败' });
      return;
    }
    
    res.json({
      success: true,
      data: rows
    });
  });
});

// 添加新建筑
router.post('/', upload.single('image'), (req, res) => {
  const { name, address } = req.body;
  
  // 验证必填字段
  if (!name || !address) {
    return res.status(400).json({ 
      error: '建筑名称和地址是必填项' 
    });
  }

  // 处理图片URL
  let imageUrl = null;
  if (req.file) {
    imageUrl = '/uploads/' + req.file.filename;
    
    // 复制文件到nginx静态目录
    try {
      const nginxUploadsDir = '/var/www/uploads';
      if (!fs.existsSync(nginxUploadsDir)) {
        fs.mkdirSync(nginxUploadsDir, { recursive: true });
      }
      const sourcePath = req.file.path;
      const destPath = path.join(nginxUploadsDir, req.file.filename);
      fs.copyFileSync(sourcePath, destPath);
    } catch (copyError) {
      console.warn('复制文件到nginx目录失败:', copyError);
    }
  }

  const sql = `INSERT INTO buildings (name, image_url, address) 
               VALUES (?, ?, ?)`;
  
  db.run(sql, [name, imageUrl, address], function(err) {
    if (err) {
      console.error('插入建筑信息失败:', err.message);
      
      // 如果数据库插入失败，删除已上传的文件
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error('删除上传文件失败:', unlinkErr);
        });
      }
      
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: '建筑名称已存在' });
      } else {
        res.status(500).json({ error: '添加建筑信息失败' });
      }
      return;
    }
    
    res.json({
      success: true,
      message: '建筑信息添加成功',
      data: {
        id: this.lastID,
        name,
        image_url: imageUrl,
        address
      }
    });
  });
});

// 删除建筑
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // 首先获取建筑信息以删除相关图片
  const selectSql = 'SELECT * FROM buildings WHERE id = ?';
  
  db.get(selectSql, [id], (err, row) => {
    if (err) {
      console.error('查询建筑信息失败:', err.message);
      res.status(500).json({ error: '删除失败' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: '建筑信息不存在' });
      return;
    }
    
    // 删除数据库记录
    const deleteSql = 'DELETE FROM buildings WHERE id = ?';
    
    db.run(deleteSql, [id], function(err) {
      if (err) {
        console.error('删除建筑信息失败:', err.message);
        res.status(500).json({ error: '删除建筑信息失败' });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: '建筑信息不存在' });
        return;
      }
      
      // 删除相关图片文件
      if (row.image_url) {
        const imagePath = path.join(__dirname, '..', row.image_url);
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('删除图片文件失败:', unlinkErr);
          }
        });
      }
      
      res.json({
        success: true,
        message: '建筑信息删除成功'
      });
    });
  });
});

module.exports = router; 