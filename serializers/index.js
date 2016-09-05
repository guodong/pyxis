"use strict";

var fs = require("fs");
var path = require("path");
var serializers = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = require(path.join(__dirname, file));
    serializers[file.substr(0, file.length - 3)] = model;
  });

module.exports = serializers;