"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports[Symbol.toStringTag] = "Module";
var common_vendor = require("./common/vendor.js");
var store_index = require("./store/index.js");
var common_appInit = require("./common/appInit.js");
require("./store/modules/user.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/login/login.js";
  "./pages/mine/mine.js";
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
    common_appInit.initApp();
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  }
};
var App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/\u4F5C\u4E1A/\u79D1\u521B/SRT/3D\u6253\u5370\u9884\u7EA6\u5C0F\u7A0B\u5E8F/SRT-Project/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  app.use(store_index.store);
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
