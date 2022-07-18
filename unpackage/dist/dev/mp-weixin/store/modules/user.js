"use strict";
var common_vendor = require("../../common/vendor.js");
let userInfoHistory = common_vendor.index.getStorageSync("userInfo") || {};
let state = {
  hasLogin: Boolean(Object.keys(userInfoHistory).length),
  info: userInfoHistory
}, getters = {
  info(state2) {
    if (!state2.hasLogin) {
      return {
        role: [],
        nickname: "\u672A\u767B\u5F55\u7528\u6237"
      };
    } else if (!state2.info.mobile) {
      return {
        role: ["VISITOR"],
        nickname: "\u5FAE\u4FE1\u533F\u540D\u7528\u6237"
      };
    } else {
      return state2.info;
    }
  },
  hasLogin(state2) {
    return state2.hasLogin;
  }
}, mutations = {
  login(state2, info) {
    let _info = state2.info;
    state2.info = Object.assign({}, _info, info);
    state2.hasLogin = true;
    console.log("state.info", state2.info);
    common_vendor.index.setStorageSync("userInfo", state2.info);
    if (info.token) {
      common_vendor.index.setStorage({
        key: "uni_id_token",
        data: state2.info.token,
        complete(e) {
        }
      });
      common_vendor.index.setStorageSync("uni_id_token_expired", state2.info.tokenExpired);
    }
  },
  logout(state2) {
    state2.info = {};
    state2.hasLogin = false;
    common_vendor.index.setStorageSync("userInfo", {});
    common_vendor.index.removeStorageSync("uni_id_token");
    common_vendor.index.setStorageSync("uni_id_token_expired", 0);
  }
}, actions = {
  logout(context) {
    common_vendor.index.showLoading({
      mask: true
    });
    common_vendor.tn.callFunction({
      name: "uni-id-cf",
      data: {
        action: "logout"
      },
      complete: (e) => {
        console.log(e);
        context.commit("logout");
        common_vendor.index.hideLoading();
      }
    });
  }
};
var user = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
exports.user = user;
