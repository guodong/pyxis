"use strict";

module.exports = function(sequelize, DataTypes) {
  var model = sequelize.define("deployment", {
    
  }, {
    classMethods: {
      associate: function(models) {
        model.belongsTo(models.version);
        model.belongsTo(models.host);
        model.hasMany(models.instance);
      },
      jsonapiDeserialize: function(data, cb) {
        var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
        new JSONAPIDeserializer({
          versions: {
            valueForRelationship: function(relationship) {
              return {
                id: relationship.id,
              }
            }
          },
          hosts: {
            valueForRelationship: function(relationship) {
              return {
                id: relationship.id,
              }
            }
          }
        }).deserialize(data, cb);
      }
    },
    instanceMethods: {
      jsonapiSerialize: function() {
        var serializer = require('../serializers/deployment');
        return serializer.serialize(this.get());
      }
    }
  });

  return model;
};