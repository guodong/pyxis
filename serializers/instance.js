'use strict';
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = new JSONAPISerializer('deployments', {
  attributes: ['created_at', 'deployment'],
  deployment: {
    attributes: ['created_at'],
    ref: 'id',
    included: false
  }
});