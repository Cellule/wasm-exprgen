"use strict";

var Promise = require("bluebird");
var fs = require("fs-extra");
Promise.promisifyAll(fs);