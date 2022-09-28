'use strict';
// const bcrypt = require('bcrypt');
// const base64 = require('base-64');
// const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelizeDatabase, DataTypes) => {
  return sequelizeDatabase.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
