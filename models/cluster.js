"use strict";

module.exports = function(sequelize, DataTypes) {
  var Cluster = sequelize.define("cluster", {
    name: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        Cluster.belongsTo(models.region, {
          onDelete: "CASCADE",
        });
        Cluster.hasMany(models.host)
      },
      jsonapiDeserialize: function(data, cb) {
        var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
        new JSONAPIDeserializer({
          regions: {
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
        var serializer = require('../serializers/cluster');
        return serializer.serialize(this.get());
      }
    }
  });
  

  return Cluster;
};