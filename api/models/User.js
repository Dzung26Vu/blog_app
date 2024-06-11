  const mongoose = require('mongoose');
  const { Schema, model } = mongoose;

  const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, min: 4 },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: '/user_avatar/default.jpg' }
  });

  const UserModel = model('User', UserSchema);

  module.exports = UserModel;
