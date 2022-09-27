'use strict';

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const base64 = require('base-64');
const { Sequelize, DataTypes } = require('sequelize');
const PORT = process.env.PORT || 3002;

const DATABASE_URL = process.env.NODE_ENV === 'test'
  ? 'sqlite::memory'
  : 'sqlite:memory';

const app = express();
app.use(express.json());


// Process FORM input and put the data on req.body
app.use(express.urlencoded({ extended: true }));

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

Users.beforeCreate( user => console.log('our user', user));

app.get('/', (req, res, next) => {
  res.send(200).send('Tray in week2');
});

// Sign up Route -- create a new user
// Two ways to test this route with httpie
// echo '{"username":"john","password":"foo"}' | http post :3000/signup
// http post :3000/signup username=john password=foo
app.post('/signup', async (req, res) => {

  try {
    console.log('Check1');
    req.body.password = await bcrypt.hash(req.body.password, 10);
    console.log(req.body.password);
    const record = await Users.create(req.body);
    res.status(200).json(record);
  } catch (e) { res.status(403).send('Error Creating User'); }
});


// Sign in Route -- login with username and password
// test with httpie
// http post :3000/signin -a john:foo
app.post('/signin', async (req, res) => {

  /*
    req.headers.authorization is : "Basic sdkjdsljd="
    To get username and password from this, take the following steps:
      - Turn that string into an array by splitting on ' '
      - Pop off the last value
      - Decode that encoded string so it returns to user:pass
      - Split on ':' to turn it into an array
      - Pull username and password from that array
  */

  let basicHeaderParts = req.headers.authorization.split(' ');  // ['Basic', 'sdkjdsljd=']
  let encodedString = basicHeaderParts.pop();  // sdkjdsljd=
  let decodedString = base64.decode(encodedString); // "username:password"
  let [username, password] = decodedString.split(':'); // username, password

  /*
    Now that we finally have username and password, let's see if it's valid
    1. Find the user in the database by username
    2. Compare the plaintext password we now have against the encrypted password in the db
       - bcrypt does this by re-encrypting the plaintext password and comparing THAT
    3. Either we're valid or we throw an error
  */
  try {
    const user = await Users.findOne({ where: { username: username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
      res.status(200).json(user);
    }
    else {
      throw new Error('Invalid User');
    }
  } catch (error) { res.status(403).send('Invalid Login'); }

});






function start() {
  app.listen(PORT, () => console.log('listening on port ', PORT));
}

module.exports = {app, start, sequelizeDatabase};