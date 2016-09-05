'use strict';
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = new JSONAPISerializer('clusters', {
  attributes: ['name', 'token', 'hosts:hosts', 'region:region'],
  hosts: {
    included: false,
    attributes: ['name', 'ips', 'cpus', 'ostype', 'totalmem', 'disk', 'arch', 'hostname'],
    ref: 'id'
  },
  region: {
    attributes: ['name'],
    ref: 'id'
  }
});