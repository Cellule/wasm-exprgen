"use strict";

var _git = require("./git");

(0, _git.checkSubmodules)().catch(function (err) {
  return console.error(err);
});