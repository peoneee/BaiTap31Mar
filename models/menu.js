let mongoose = require('mongoose');

let menuSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    URL: {
        type: String,
        default: "/"
    },
    parent: {
        type: mongoose.Types.ObjectId,
        ref: 'Menu',
        validate: {
            validator: function (value) {
                return value !== this._id; // Không cho phép menu trỏ tới chính nó
            },
            message: "Menu không thể là cha của chính nó"
        }
    }
}, { timestamps: true }); // Thêm createdAt, updatedAt

module.exports = mongoose.model('Menu', menuSchema);
