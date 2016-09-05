"use strict";

module.exports = function(sequelize, DataTypes) {
  var Region = sequelize.define("region", {
    name: DataTypes.STRING,

}, {
    classMethods: {
      associate: function(models) {
        Region.hasMany(models.cluster)
      }
    }
  });

  return Region;
};