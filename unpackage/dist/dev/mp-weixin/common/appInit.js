"use strict";
var common_vendor = require("./vendor.js");
var store_index = require("../store/index.js");
const db = common_vendor.tn.database();
async function initApp() {
  function onDBError({
    code,
    message
  }) {
    console.log("onDBError", {
      code,
      message
    });
    console.error(code, message);
    if ([
      "TOKEN_INVALID_INVALID_CLIENTID",
      "TOKEN_INVALID",
      "TOKEN_INVALID_TOKEN_EXPIRED",
      "TOKEN_INVALID_WRONG_TOKEN",
      "TOKEN_INVALID_ANONYMOUS_USER"
    ].includes(code)) {
      common_vendor.index.reLaunch({
        url: "/pages/index/index"
      });
    }
  }
  db.on("error", onDBError);
  let callFunctionOption;
  common_vendor.tn.addInterceptor("callFunction", {
    async invoke(option) {
      if (option.name == "uni-id-cf" && option.data.action.slice(0, 5) == "login") {
        option.data.deviceInfo = await getDeviceInfo();
        console.log("\u91CD\u65B0\u767B\u5F55/\u6CE8\u518C\uFF0C\u83B7\u53D6\u8BBE\u5907id", option.data.deviceInfo);
      }
      callFunctionOption = option;
    },
    fail(e) {
      console.error("\u7F51\u7EDC\u8BF7\u6C42\u9519\u8BEF\u7801\uFF1A", JSON.stringify(e));
      if (debug) {
        common_vendor.index.showModal({
          content: JSON.stringify(e),
          showCancel: false
        });
        console.error(e);
      } else {
        common_vendor.index.showModal({
          content: "\u7CFB\u7EDF\u9519\u8BEF\u8BF7\u7A0D\u540E\u518D\u8BD5\uFF01",
          showCancel: false,
          confirmText: "\u786E\u5B9A"
        });
      }
      common_vendor.index.getNetworkType({
        complete: (res) => {
          if (res.networkType == "none") {
            common_vendor.index.showToast({
              title: "\u624B\u673A\u7F51\u7EDC\u5F02\u5E38",
              icon: "none"
            });
            console.log("\u624B\u673A\u7F51\u7EDC\u5F02\u5E38");
            let callBack = (res2) => {
              console.log(res2);
              if (res2.isConnected) {
                common_vendor.index.showToast({
                  title: "\u6062\u590D\u8054\u7F51\u81EA\u52A8\u91CD\u65B0\u6267\u884C",
                  icon: "none"
                });
                console.log(res2.networkType, "\u6062\u590D\u8054\u7F51\u81EA\u52A8\u91CD\u65B0\u6267\u884C");
                common_vendor.index.offNetworkStatusChange((e2) => {
                  console.log("\u79FB\u9664\u76D1\u542C\u6210\u529F", e2);
                });
                common_vendor.tn.callFunction(callFunctionOption);
                common_vendor.index.offNetworkStatusChange(callBack);
              }
            };
            common_vendor.index.onNetworkStatusChange(callBack);
          }
        }
      });
    },
    success: (e) => {
      const {
        token,
        tokenExpired
      } = e.result;
      if (token && tokenExpired) {
        store_index.store.commit("user/login", {
          token,
          tokenExpired
        });
      }
      switch (e.result.code) {
        case 403:
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
          break;
        case 30203:
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
          break;
        case 50101:
          common_vendor.index.showToast({
            title: e.result.msg,
            icon: "none",
            duration: 2e3
          });
          break;
        default:
          console.log("code\u7684\u503C\u662F\uFF1A" + e.result.code, "\u53EF\u4EE5\u5728\u4E0A\u9762\u6DFB\u52A0case\uFF0C\u81EA\u52A8\u5904\u7406\u54CD\u5E94\u4F53");
          break;
      }
      switch (e.result.errCode) {
        case "uni-id-token-not-exist":
          common_vendor.index.showToast({
            title: "\u767B\u5F55\u4FE1\u606F\u5931\u6548",
            icon: "none"
          });
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
          break;
      }
    }
  });
}
function getDeviceInfo() {
  let deviceInfo = {
    "uuid": "",
    "vendor": "",
    "push_clientid": "",
    "imei": "",
    "oaid": "",
    "idfa": "",
    "model": "",
    "platform": ""
  };
  const {
    model,
    platform
  } = common_vendor.index.getSystemInfoSync();
  Object.assign(deviceInfo, {
    model,
    platform
  });
  return deviceInfo;
}
exports.initApp = initApp;
