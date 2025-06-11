const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const csrf = require('csurf');
const MongoDBStore = require('connect-mongodb-session')(session);
const otpService = require('./services/OtpService');
const Message = require('./models/Message');
const User = require('./models/User');
const luggage = require('./models/Storage');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle chat messages
  socket.on('chat message', async (msg) => {
    try {
      // Save message to database
      const message = new Message({
        name: msg.sender || 'Anonymous',
        email: msg.email || 'chat@system',
        message: msg.text,
        isChat: true,
        timestamp: new Date()
      });
      await message.save();
      
      // Broadcast message to all clients
      io.emit('chat message', {
        sender: msg.sender || 'Assistant',
        text: msg.text,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error handling chat message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

const store = new MongoDBStore({
  uri: process.env.mongo,
  collection: 'mysession',
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'This is a secret',
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

// CSRF protection
const csrfProtection = csrf();
app.use(csrfProtection); 

// Make CSRF token available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
}); 
 
mongoose
  .connect(process.env.mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected');
  })
  .catch((error) => {
    console.log(error);
  });

const checkAuth = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
};

const profileRoutes = require('./Routes/profileRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const storeRoutes = require('./store');
const adminRoutes = require('./routes/adminRoutes');

app.use('/profile', profileRoutes);
app.use('/api', deliveryRoutes);
app.use('/api/store', storeRoutes);
app.use('/admin', adminRoutes);

// Routes
app.get('/signup', (req, res) => {
  res.render('signup', { name: '', email: '', message: '' });
});

app.get('/login', (req, res) => {
  res.render('login', { 
    email: '', 
    message: '',
    csrfToken: req.csrfToken() 
  });
});

app.get('/home', checkAuth, (req, res) => {
  res.render('home', { user: req.session.user });
});

app.get('/profile', checkAuth, (req, res) => {
  res.render('profile', { user: req.session.user });
});

app.get('/store', (req, res) => {
  res.render('store');
});

app.post('/store', async (req, res) => {
  try {
    const { userId, luggageNumber, checkInTime, checkOutTime, status, price } = req.body;
    const newStore = new luggage({
      userId,
      luggageNumber,
      checkInTime,
      checkOutTime,
      status,
      price,
    });  
    await newStore.save();
    res.redirect('/store');
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err); 
      return res.status(500).send({ message: 'Logout failed' });
    }
    res.redirect('/login'); 
  });
});

app.post('/signup', async (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.render('signup', { name, email, message: 'Invalid email format' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.render('signup', { name, email, message: 'Password must be at least 6 characters long' });
  }
  
  if (password !== confirm_password) {
    return res.render('signup', { name, email, message: 'Passwords do not match' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.render('signup', { name, email, message: 'User already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    user = new User({
      name,
      email,
      password: hashPassword,
      confirm_password: hashPassword,
    });

    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.render('login', { email, message: 'Invalid email format' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.render('login', { email, message: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await User.findOne({ email });
    const adminEmail = 'mohanasrinivas08@gmail.com';
    const adminPassword = 'Mohana@123';

    // Check if the user is an admin
    if (email === adminEmail && password === adminPassword) {
      req.session.isAdmin = true;
      req.session.isAuthenticated = true;
      req.session.user = {
        _id: 'admin',
        name: 'Admin',
        email: adminEmail,
        role: 'admin'
      };
      return res.redirect('/admin/dashboard');
    } else {
      req.session.isAdmin = false;
    }

    if (!user) {
      return res.render('login', { email, message: 'Email not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.render('login', { email, message: 'Invalid credentials' });
    }

    req.session.isAuthenticated = true;
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.post('/home', async (req, res) => {
  const { name, email, message } = req.body;
  const user = new Message({
    name,
    email,
    message,
  });
  await user.save();
  res.redirect('/home#contact');
});

// Route to send OTP
app.post('/send-otp', async (req, res) => {
  const { phoneNumber, email } = req.body;

  if (!phoneNumber && !email) {
    return res.status(400).send({ message: 'Phone number or email is required' });
  }

  const otp = otpService.generateOTP();
  req.session.otp = otp; // Store OTP in session
  req.session.phoneNumber = phoneNumber; // Store phone number in session
  req.session.email = email; // Store email in session

  try {
    if (phoneNumber) {
      otpService.sendOTPByConsole(phoneNumber, otp); // Simulate sending OTP to phone
    } else if (email) {
      await otpService.sendOTPByEmail(email, otp); // Send OTP via email
    }

    res.status(200).send({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).send({ message: 'Failed to send OTP', error: error.message });
  }
});

// Route to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).send({ message: 'OTP is required' });
  }

  if (otp === req.session.otp) {
    // Mark the phone number or email as verified in the database
    await Details.updateOne(
      { userId: req.session.user._id },
      { phoneVerified: !!req.session.phoneNumber, emailVerified: !!req.session.email }
    );

    res.status(200).send({ message: 'OTP verified successfully' });
  } else {
    res.status(400).send({ message: 'Invalid OTP' });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
