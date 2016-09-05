'use strict';
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = new JSONAPISerializer('hosts', {
  attributes: ['name', 'token', 'ips', 'ostype', 'cpus', 'totalmem', 'disk', 'arch', 'hostname', 'deployments:deployments'],
  clusters: {
    attributes: ['name'],
    ref: 'id'
  },
  deployments: {
    ref: 'id'
  }
});