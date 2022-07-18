"use strict";
var store_modules_user = require("./modules/user.js");
var common_vendor = require("../common/vendor.js");
const store = common_vendor.createStore({
  modules: {
    user: store_modules_user.user
  }
});
exports.store = store;
