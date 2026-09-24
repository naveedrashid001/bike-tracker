const mongoose = require('mongoose');

// Route param mein di gayi ID Mongo ka valid ObjectId hai ya nahi, check karta hai.
// Agar na ho to seedha 400 bhej deta hai, warna Mongoose CastError throw karta
// jo generic catch block mein internal DB error message leak kar sakta tha.
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = { isValidObjectId };
