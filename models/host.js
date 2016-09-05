"use strict";

module.exports = function(sequelize, DataTypes) {
  var Host = sequelize.define("host", {
    name: DataTypes.STRING,
    ips: DataTypes.JSON,
    ostype: DataTypes.STRING,
    cpus: DataTypes.JSON,
    totalmem: DataTypes.STRING,
    disk: DataTypes.STRING,
    arch: DataTypes.STRING,
    hostname: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Host.belongsTo(models.cluster, {
          onDelete: "CASCADE",
        });
        Host.hasMany(models.deployment);
      },
      jsonapiDeserialize: function(data, cb) {
        var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
        new JSONAPIDeserializer({
          clusters: {
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
        var serializer = require('../serializers/host');
        return serializer.serialize(this.get());
      }
    }
  });

  return Host;
};