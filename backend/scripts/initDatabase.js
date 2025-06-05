const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保database目录存在
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'buildings.db');
const db = new sqlite3.Database(dbPath);

console.log('正在初始化数据库...');

// 创建建筑信息表
db.serialize(() => {
  // 创建buildings表（删除经纬度字段）
  db.run(`CREATE TABLE IF NOT EXISTS buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('创建表失败:', err.message);
    } else {
      console.log('buildings表创建成功');
    }
  });

  // 插入示例数据
  const sampleBuildings = [
    {
      name: '北大楼',
      image_url: 'https://obsidian1122.oss-cn-nanjing.aliyuncs.com/picture/beidalou.webp',
      address: '南京大学鼓楼校区北园'
    },
    {
      name: '拉贝故居',
      image_url: 'https://obsidian1122.oss-cn-nanjing.aliyuncs.com/picture/labei.webp',
      address: '南京大学鼓楼校区南园东南角'
    },
    {
      name: '赛珍珠故居',
      image_url: 'https://obsidian1122.oss-cn-nanjing.aliyuncs.com/picture/saizhenzhu.webp',
      address: '南京大学鼓楼校区北园西墙角'
    }
  ];

  const insertStmt = db.prepare(`INSERT OR REPLACE INTO buildings 
    (name, image_url, address) VALUES (?, ?, ?)`);

  sampleBuildings.forEach(building => {
    insertStmt.run([
      building.name,
      building.image_url,
      building.address
    ], (err) => {
      if (err) {
        console.error(`插入${building.name}失败:`, err.message);
      } else {
        console.log(`已插入建筑: ${building.name}`);
      }
    });
  });

  insertStmt.finalize();
});

db.close((err) => {
  if (err) {
    console.error('关闭数据库失败:', err.message);
  } else {
    console.log('数据库初始化完成!');
  }
}); 