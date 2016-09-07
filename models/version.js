"use strict";

module.exports = function(sequelize, DataTypes) {
  var model = sequelize.define("version", {
    name: DataTypes.STRING,
    comment: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        model.belongsTo(models.cloudware, {
          onDelete: "CASCADE",
        });
        model.hasMany(models.deployment)
      },
      jsonapiDeserialize: function(data, cb) {
        var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
        new JSONAPIDeserializer({
          cloudwares: {
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
        var serializer = require('../serializers/version');
        return serializer.serialize(this.get());
      }
    }
  });

  return model;
};