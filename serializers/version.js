'use strict';
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = new JSONAPISerializer('versions', {
  attributes: ['name', 'created_at', 'cloudware:cloudware'],
  cloudware: {
    attributes: ['name', 'logo'],
    ref: 'id'
  }
});