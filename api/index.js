const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const upload = multer({ storage: multer.memoryStorage() });
const uploadMiddleware = multer({ dest: 'uploads/' });
const path = require('path');
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

// Kết nối tới cơ sở dữ liệu MongoDB
mongoose.connect("mongodb+srv://dzungvu26:dzungvu26@cluster0.bvb7ala.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

//đăng ký tài khoản mới
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body; 

  try {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
    
      return res.status(400).json({ error: 'Username already exists' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
     
      return res.status(400).json({ error: 'Email already exists' });
    }

    const userDoc = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, salt),
    });

    
    res.json(userDoc);
    
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// API đăng nhập
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDoc = await User.findOne({ email });

    if (!userDoc) {
      return res.status(400).json('User not found');
    }

    
    const passOk = bcrypt.compareSync(password, userDoc.password);

    if (passOk) {
    
      const tokenPayload = {
        id: userDoc._id,
        email: userDoc.email,
        username: userDoc.username,
        avatar: userDoc.avatar,
      };
      
      jwt.sign(tokenPayload, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token).json({
          token,
          user: tokenPayload, 
        });
      });
    } else {
     
      res.status(400).json('Wrong credentials');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json('An error occurred while logging in');
  }
});

// API thay đổi mật khẩu
app.post("/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { email } = req.body; 

  try {
    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      return res.status(400).json({ success: false, error: "User not found" });
    }
    if (!currentPassword || !bcrypt.compareSync(currentPassword, userDoc.password)) {
      return res.status(400).json({ success: false, error: "Invalid current password" });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);
    await User.updateOne({ email }, { password: hashedNewPassword });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error changing password" });
  }
});

// API lấy thông tin profile của người dùng
app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

// API đăng xuất
app.post('/logout', (req,res) => {
  res.clearCookie('token'); 
  res.redirect('/');
  
});

// API đăng bài viết mới
app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });
});

// API chỉnh sửa bài viết
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  try {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path + '.' + ext;
      fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    const decodedToken = jwt.verify(token, secret);

    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findByIdAndUpdate(id, {
      title,
      summary,
      content,
      cover: newPath ? newPath : undefined, 
    });

    if (!postDoc) {
      return res.status(404).json('Không tìm thấy bài viết');
    }

    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(decodedToken.id);
    if (!isAuthor) {
      return res.status(400).json('Bạn không phải là tác giả');
    }

    res.json(postDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API lấy danh sách bài viết
app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      
  );
});

// API lấy thông tin của một bài viết cụ thể
app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

// API xóa bài viết
app.delete("/post/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    if (post.cover) {
      const filePath = path.join(__dirname, post.cover);
      fs.unlinkSync(filePath);
    }
    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error deleting post" });
  }
});

// API lấy danh sách bài viết của người dùng
app.get('/my-blog', async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decodedToken = jwt.verify(token, secret);

    const posts = await Post.find({ author: decodedToken.id })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API lấy avatar của người dùng
app.get('/avatar/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'user_avatar', filename);

 
  if (fs.existsSync(filePath)) {
   
    res.sendFile(filePath);
  } else {
    
    const defaultAvatarPath = path.join(__dirname, 'user_avatar', 'default.jpg');
    res.sendFile(defaultAvatarPath);
  }
});

// API lấy số lượng bài viết của người dùng
app.get('/post-count', async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decodedToken = jwt.verify(token, secret);

    
    const postCount = await Post.countDocuments({ author: decodedToken.id });

    res.json({ postCount });
  } catch (error) {
    console.error('Error fetching user post count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.listen(4000);
