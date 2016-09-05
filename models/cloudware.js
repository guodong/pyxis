"use strict";

module.exports = function(sequelize, DataTypes) {
  var model = sequelize.define("cloudware", {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    logo: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        model.hasMany(models.version);
      },
      jsonapiDeserialize: function(data, cb) {
        var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
        new JSONAPIDeserializer().deserialize(data, cb);
      }
    },
    instanceMethods: {
      jsonapiSerialize: function() {
        var serializer = require('../serializers/cloudware');
        return serializer.serialize(this.get());
      }
    }
  });

  return model;
};