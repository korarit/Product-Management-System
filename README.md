# Product Management System
Task ฝึกหัดใน dev init 2 โดย กรฤต แสงทอง

## วิธีการใช้งาน
### install package
คำสั่งติดตั้ง expressJS และ dotenv
```
npm install
```

### environment variables
สร้างไฟล์ .env และคัดลอก ข้อความด้านล่าง ไปวางในไฟล์
```
PORT=3000
LOGIN_TOKEN=your_login_token
```

### command for test
คำสั่งสำหรับทดสอบ
```
npm run test
```

## Endpoint ใช้ Authorization ด้วย Bearer <LOGIN_TOKEN>
### /product/all (GET ดึงรายการทั้งหมด)
ไม่มี payload
### /product (POST เพิ่มรายการ)
ตัวอย่าง payload
```
{
    "name": "test",
    "type": "อาหาร",
    "price":1000,
    "amount": 10
}
```
### /product/:id (DELETE ลบ)
ไม่มี payload (:id แทนที่ด้วย id สินค้า)
### /product/:id (PUT แก้ไข)
ตัวอย่าง payload (:id แทนที่ด้วย id สินค้า)
สามารถแก้ไขเฉพาะบางอย่างได้
```
{
    "name": "test"
}
```
