import express from "express";
import dotenv from "dotenv";

//ใช้ dotenv เพื่อดึงค่าจากไฟล์ .env
dotenv.config();
//เก็บข้อมูลสินค้า ในรูปแบบของ Array of Object โดยแต่ละ Object จะประกอบด้วย name, type, price, amount
const database = []

//search index of product by id
function searchIndex(id) {
    for (let i = 0; i < database.length; i++) {
        if (database[i].id == id) {
            return i;
        }
    }
    return -1;
}

//สร้าง express app
const app = express();

//ใช้ middleware เพื่อให้ express สามารถอ่าน body ของ request ในรูปแบบของ JSON
app.use(express.json());

//ใช้ middleware เพื่อตรวจสอบ Authorization header
app.use((req, res, next) => {
    const auth = req.headers.authorization;

    //ตรวจสอบว่ามี Authorization header หรือไม่
    if (!auth) {
        return res.status(401).json({message: "Unauthorized"});
    }
    const get_token = auth.split(" ");

    //ตรวจสอบว่า Authorization header มีรูปแบบ Bearer <token> หรือไม่
    if (get_token[0] != "Bearer" || get_token.length != 2 || !get_token[1]) {
        return res.status(401).json({message: "Unauthorized Authentication header format is Bearer <token>"});
    }

    //ตรวจสอบว่า Authorization header ตรงกับ login token หรือไม่
    if (get_token == process.env.LOGIN_TOKEN) {
        next();
    } else {
        return res.status(401).json({message: "Unauthorized"});
    }
});


//ดูรายการสินค้าทั้งหมด
app.get("/product/all", (req, res) => {
        //ส่งข้อมูลสินค้าทั้งหมดกลับไป ในรูปแบบของ JSON Array
        try {
            return res.status(200).json(database);
        } catch (error) {
            return res.status(500).json({message: "Internal server error"});
        }
    }
);

//เพิ่มสินค้า
app.post("/product", (req, res) => {
        //รับข้อมูลสินค้าจาก body ประกอบด้วย name, type, price, amount 
        const product_data = req.body;

        //validate ข้อมูล
        if (!product_data.name || !product_data.type || !product_data.price || !product_data.amount) {
            return res.status(400).json({message: "Invalid data"});
        }else if (product_data.name.length == 0 || product_data.type.length == 0) {
            return res.status(400).json({message: "Name or type must not be empty"});
        }else if (isNaN(product_data.price) || isNaN(product_data.amount)) {
            return res.status(400).json({message: "Invalid data type for price or amount"});  
        }else if (product_data.price < 0 || product_data.amount < 0) {
            return res.status(400).json({message: "Price or amount must be positive number"});
        }

        //เพิ่มข้อมูลสินค้าลงใน database
        try {
            //สร้าง id ให้สินค้า โดยให้เป็น index ของสินค้าใน database
            let id = database.length;
            let data = {
                id: id,
                name: product_data.name,
                type: product_data.type,
                price: product_data.price,
                amount: product_data.amount
            }

            database.push(data);
            return res.status(200).json({message: "Product add"});
        } catch (error) {
            return res.status(500).json({message: "Internal server error"});
        }
    }
);

//ลบสินค้า
app.delete("/product/:id", (req, res) => {
        //รับ id ของสินค้าที่ต้องการลบ
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid id"});
        }
        //ค้นหา index ของสินค้าที่ต้องการลบ
        const index = searchIndex(id);
        if (index == -1) {
            return res.status(400).json({message: "Product not found"});
        }

        //ลบสินค้า
        try {
            database.splice(index, 1);
            return res.status(200).json({message: "Product deleted"});
        } catch (error) {
            return res.status(500).json({message: "Internal server error"});
        }

    }
);

//แก้ไขสินค้า
app.put("/product/:id", (req, res) => {

        //รับ id ของสินค้าที่ต้องการแก้ไข
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid id"});
        }
        //ค้นหา index ของสินค้าที่ต้องการแก้ไข
        const index = searchIndex(id);
        if (index == -1) {
            return res.status(400).json({message: "Product not found"});
        }

        //รับข้อมูลสินค้าที่ต้องการแก้ไขจาก body ประกอบด้วย name, type, price, amount
        const product_data = req.body;

        //validate ข้อมูล ต้องมีอย่างน้อย 1 ข้อมูลที่ต้องการแก้ไข
        if (!product_data.name && !product_data.type && !product_data.price && !product_data.amount) {
            return res.status(400).json({message: "Invalid data"});
        }

        //แก้ไขชื่อสินค้า
        if (product_data.name) {
            
            //validate ข้อมูล ต้องมีความยาวมากกว่า 0
            if (product_data.name.length == 0) {
                return res.status(400).json({message: "Name must not be empty"});
            }

            try {
                database[index].name = product_data.name;
            } catch (error) {
                return res.status(500).json({message: "Internal server error"});
            }
        }

        //แก้ไขประเภทสินค้า
        if (product_data.type) {

            //validate ข้อมูล ต้องมีความยาวมากกว่า 0
            if (product_data.type.length == 0) {
                return res.status(400).json({message: "Type must not be empty"});
            }

            try {
                database[index].type = product_data.type;
            }catch (error) {
                return res.status(500).json({message: "Internal server error"});
            }
        }

        //แก้ไขราคาสินค้า
        if (product_data.price) {

            //validate ข้อมูล ต้องเป็นตัวเลขและมากกว่า 0
            if (isNaN(product_data.price)) {
                return res.status(400).json({message: "Invalid data type for price"});
            }else if (product_data.price < 0) {
                return res.status(400).json({message: "Price must be positive number"});
            }

            try {
                database[index].price = product_data.price;
            } catch (error) {
                return res.status(500).json({message: "Internal server error"});
            }
        }

        //แก้ไขจำนวนสินค้า
        if (product_data.amount) {

            //validate ข้อมูล ต้องเป็นตัวเลขและมากกว่า 0
            if (isNaN(product_data.amount)) {
                return res.status(400).json({message: "Invalid data type for amount"});
            }else if (product_data.amount < 0) {
                return res.status(400).json({message: "Amount must be positive number"});
            }else if (Number.isInteger(product_data.amount) == false){
                return res.status(400).json({message: "Amount must be integer number"});
            }

            try {
                database[index].amount = product_data.amount;
            }
            catch (error) {
                return res.status(500).json({message: "Internal server error"});
            }
        }

        return res.status(200).json({message: "Product updated"});

    }
);


//เริ่มต้นเซิร์ฟเวอร์
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});