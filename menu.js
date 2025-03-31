const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/yourdbname", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Định nghĩa Schema Menu
const menuSchema = new mongoose.Schema({
  text: { type: String, required: true },
  url: { type: String, required: true, default: "/" },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", default: null },
});

const Menu = mongoose.model("Menu", menuSchema);

// GET: Hiển thị menu theo bậc cha con
app.get("/menus", async (req, res) => {
  try {
    const menus = await Menu.find().lean();
    
    const buildTree = (parentId = null) =>
      menus
        .filter((menu) => String(menu.parent) === String(parentId))
        .map((menu) => ({ ...menu, children: buildTree(menu._id) }));

    res.json(buildTree());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Thêm menu mới
app.post("/menus", async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    res.status(201).json(menu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT: Cập nhật menu
app.put("/menus/:id", async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(menu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE: Xóa menu
app.delete("/menus/:id", async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: "Menu deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Khởi động server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
