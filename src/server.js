'use strict';

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const base64 = require('base-64');
const { Sequelize, DataTypes } = require('sequelize');


const forbid = require('./middleware/403');
const errorHandler = require('./middleware/500');

// const Users = require('./auth/models/users-model');
const authRouter = require('./auth/router');
// const userSchema = require('./auth/models/users-model');


const PORT = process.env.PORT || 3002;
const DATABASE_URL = process.env.NODE_ENV === 'test'
  ? 'sqlite::memory'
  : 'sqlite:memory';
const app = express();
app.use(express.json());
// Process FORM input and put the data on req.body
app.use(express.urlencoded({ extended: true }));


// Users.beforeCreate( user => console.log('our user', user));


let options = process.env.NODE_ENV === 'production' ? {
  dialectOptions: {
    ssl: true,
    rejectUnauthorized:false,
  },
} : {};
const sequelizeDatabase = new Sequelize(DATABASE_URL, options);
const Users = sequelizeDatabase.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
// const UserModel = userSchema (sequelizeDatabase, DataTypes);

app.get('/', (req, res, next) => {
  res.status(200).send('Tray in week2day1');
  next();
});

app.post('/signup', async (req, res) => {
  try {
    // console.log('Check1');
    // console.log('req body info: ', req.body);
    req.body.password = await bcrypt.hash(req.body.password, 10);
    // console.log(req.body.password);
    const record = await Users.create(req.body);
    res.status(200).json(record);
  } catch (e) { res.status(403).send('Error Creating User'); }
});

// app.post('/signin', async (req, res) => {
//   console.log('here yet?');
//   let basicHeaderParts = req.headers.authorization.split(' ');
//   let encodedString = basicHeaderParts.pop();
//   let decodedString = base64.decode(encodedString);
//   let [username, password] = decodedString.split(':');
//   try {
//     const user = await Users.findOne({ where: { username: username } });
//     const valid = await bcrypt.compare(password, user.password);
//     if (valid) {
//       res.status(200).json(user);
//     }
//     else {
//       throw new Error('Invalid User');
//     }
//   } catch (error) { res.status(403).send('Invalid Login'); }
// });

app.use(authRouter);
app.use('*', forbid);
app.use(errorHandler);

function start() {
  app.listen(PORT, () => console.log('listening on port ', PORT));
}

module.exports = {
  app, 
  start, 
  sequelizeDatabase,
  // Users,
  // UserModel,
};