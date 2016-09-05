'use strict';
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = new JSONAPISerializer('cloudwares', {
  attributes: ['name', 'description', 'logo', 'versions:versions'],
  versions: {
    attributes: ['name', 'comment', 'created_at', 'image'],
    ref: 'id'
  }
});