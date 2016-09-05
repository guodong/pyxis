'use strict';
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = new JSONAPISerializer('regions', {
  attributes: ['name', 'clusters:clusters'],
  included: false,
  clusters: {
    attributes: ['name'],
    ref: 'id',
    included: false
  }
});