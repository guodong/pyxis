"use strict";

module.exports = function(sequelize, DataTypes) {
  var model = sequelize.define("instance", {
    port: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        model.belongsTo(models.deployment);
        model.belongsTo(models.version);
      },
      jsonapiDeserialize: function(data, cb) {
        var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
        new JSONAPIDeserializer({
          deployments: {
            valueForRelationship: function(relationship) {
              return {
                id: relationship.id,
              }
            }
          },
          versions: {
            valueForRelationship: function(relationship) {
              return {
                id: relationship.id
              }
            }
          }
        }).deserialize(data, cb);
      }
    },
    instanceMethods: {
      jsonapiSerialize: function() {
        var serializer = require('../serializers/instance');
        return serializer.serialize(this.get());
      }
    }
  });

  return model;
};