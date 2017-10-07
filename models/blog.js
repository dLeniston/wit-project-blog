var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
    title: String,
    image: {type: String, default: "https://static.pexels.com/photos/273011/pexels-photo-273011.jpeg"},
    body: String,
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Blog", blogSchema);