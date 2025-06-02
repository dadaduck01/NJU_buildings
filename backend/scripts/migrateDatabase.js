const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/buildings.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 开始数据库迁移...');

db.serialize(() => {
  // 1. 创建新的临时表
  console.log('📋 创建新表结构...');
  db.run(`CREATE TABLE buildings_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ 创建新表失败:', err.message);
      return;
    }
    console.log('✅ 新表创建成功');
  });

  // 2. 从旧表复制数据到新表（排除经纬度字段）
  console.log('📦 迁移数据...');
  db.run(`INSERT INTO buildings_new (id, name, image_url, address, created_at)
          SELECT id, name, image_url, address, created_at FROM buildings`, (err) => {
    if (err) {
      console.error('❌ 数据迁移失败:', err.message);
      return;
    }
    console.log('✅ 数据迁移成功');
  });

  // 3. 删除旧表
  console.log('🗑️ 删除旧表...');
  db.run(`DROP TABLE buildings`, (err) => {
    if (err) {
      console.error('❌ 删除旧表失败:', err.message);
      return;
    }
    console.log('✅ 旧表删除成功');
  });

  // 4. 重命名新表
  console.log('🔄 重命名新表...');
  db.run(`ALTER TABLE buildings_new RENAME TO buildings`, (err) => {
    if (err) {
      console.error('❌ 重命名表失败:', err.message);
      return;
    }
    console.log('✅ 表重命名成功');
  });

  // 5. 验证迁移结果
  console.log('🔍 验证迁移结果...');
  db.get('SELECT COUNT(*) as count FROM buildings', (err, row) => {
    if (err) {
      console.error('❌ 验证失败:', err.message);
      return;
    }
    console.log(`✅ 迁移完成！共保留 ${row.count} 条建筑记录`);
    
    // 显示新表结构
    db.all("PRAGMA table_info(buildings)", (err, columns) => {
      if (err) {
        console.error('❌ 获取表结构失败:', err.message);
        return;
      }
      console.log('📋 新表结构:');
      columns.forEach(col => {
        console.log(`   ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
      });
    });
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ 关闭数据库失败:', err.message);
  } else {
    console.log('🎉 数据库迁移完成！');
  }
}); 