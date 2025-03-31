var express = require('express');
var router = express.Router();
let menuSchema = require('../models/menu');

/* ✅ API lấy danh sách menu cha + con */
router.get('/', async function (req, res) {
  try {
    let allMenus = await menuSchema.find().populate('parent');

    let menuHierarchy = allMenus
      .filter(menu => !menu.parent)
      .map(parent => ({
        _id: parent._id,
        text: parent.text,
        URL: parent.URL,
        children: allMenus
          .filter(menu => String(menu.parent?._id) === String(parent._id))
          .map(child => ({
            _id: child._id,
            text: child.text,
            URL: child.URL
          }))
      }));

    res.status(200).json(menuHierarchy);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ✅ API thêm menu cha + con */
router.post('/', async function (req, res) {
  try {
    const { text, URL, parent } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Tên menu không được để trống" });

    let newObj = { text, URL };

    if (parent) {
      let parentMenu = await menuSchema.findOne({ text: parent }); // Tìm menu cha theo text
      if (parentMenu) {
        newObj.parent = parentMenu._id; // Gán _id của menu cha
      } else {
        return res.status(400).json({ success: false, message: "Menu cha không tồn tại" });
      }
    }

    let newMenu = new menuSchema(newObj);
    await newMenu.save();
    res.status(201).json({ success: true, message: "Menu đã được thêm", newMenu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ✅ API sửa menu */
router.put('/:id', async function (req, res) {
  try {
    const { text, URL, parent } = req.body;
    let updateObj = { text, URL };
    
    if (parent) {
      let parentMenu = await menuSchema.findById(parent);
      if (!parentMenu) {
        return res.status(400).json({ success: false, message: "Menu cha không tồn tại" });
      }
      updateObj.parent = parent;
    }

    let updatedMenu = await menuSchema.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    if (!updatedMenu) return res.status(404).json({ success: false, message: "Menu không tồn tại" });

    res.status(200).json({ success: true, message: "Menu đã được cập nhật", updatedMenu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ✅ API xóa menu */
router.delete('/:id', async function (req, res) {
  try {
    let deletedMenu = await menuSchema.findByIdAndDelete(req.params.id);
    if (!deletedMenu) return res.status(404).json({ success: false, message: "Menu không tồn tại" });
    
    // Xóa tất cả menu con
    await menuSchema.deleteMany({ parent: req.params.id });
    
    res.status(200).json({ success: true, message: "Menu đã được xóa" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
