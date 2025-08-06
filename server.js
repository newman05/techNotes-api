require('dotenv').config();
require('express-async-errors') ;

const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOption');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8000;

console.log(process.env.NODE_ENV);

connectDB()

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json())

app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'public')));



const rootRouter = require('./routes/root');
app.use('/', rootRouter);
app.use('/notes', require('./routes/noteRoutes')) 
app.use('/auth', require('./routes/authRoutes')) 

app.use('/users' , require('./routes/userRoutes')) ; 

// ✅ TEMP TEST USER ROUTE — PLACE THIS HERE
app.post('/test-user', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const User = require('./models/User'); // Adjust path if needed

    const hashedPwd = await bcrypt.hash('test123', 10);
    const newUser = new User({
      username: 'Test',
      password: hashedPwd,
      roles: ['User']
    });

    await newUser.save();
    res.send('Test user created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating test user');
  }
});


app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');

  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

})

mongoose.connection.on('error', err => {
  console.log(err);
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 
    'mongoErrLog.log');

});

