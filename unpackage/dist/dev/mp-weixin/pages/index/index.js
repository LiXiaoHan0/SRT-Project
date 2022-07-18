"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var common_vendor = require("../../common/vendor.js");
var _imports_0 = "/static/grey.jpg";
const _sfc_main = {
  data() {
    return {};
  },
  computed: __spreadProps(__spreadValues({}, common_vendor.mapGetters({
    userInfo: "user/info",
    login: "user/hasLogin"
  })), {
    identity() {
      switch (this.userInfo.role[0]) {
        case "VISITOR":
          return ["\u6E38\u5BA2", "default"];
        case "USER":
          return ["\u666E\u901A\u7528\u6237", "primary"];
        case "AUDITOR":
          return ["\u7BA1\u7406\u5458", "warning"];
        case "admin":
          return ["\u8D85\u7EA7\u7BA1\u7406\u5458", "error"];
        default:
          return ["\u672A\u6388\u6743", "default"];
      }
    },
    buttonText() {
      if (!this.login)
        return "\u5FAE\u4FE1\n\u767B\u9646";
      else if (!this.userInfo.mobile)
        return "\u5B8C\u5584\n\u4FE1\u606F";
      else
        return "\u4FEE\u6539\n\u4FE1\u606F";
    }
  }),
  onLoad() {
  },
  onPullDownRefresh() {
    this.refreshUser("\u5237\u65B0\u6210\u529F");
  },
  methods: __spreadProps(__spreadValues({}, common_vendor.mapMutations({
    setUserInfo: "user/login"
  })), {
    refreshUser(text) {
      return new Promise((resolve, reject) => {
        common_vendor.index.showLoading({
          mask: true
        }).then(() => {
          return common_vendor.index.login({
            "provider": "weixin",
            "onlyAuthorize": true
          });
        }).then((res) => {
          console.log(res);
          return common_vendor.tn.callFunction({
            name: "uni-id-cf",
            data: {
              action: "loginByWeixin",
              params: res.code
            }
          });
        }).then(({
          result
        }) => {
          console.log(result);
          if ("mobile" in result.userInfo) {
            this.setUserInfo(result.userInfo);
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: text,
              icon: "success"
            });
            console.log(text);
            resolve({ bind: true });
          } else {
            common_vendor.index.hideLoading();
            resolve({ bind: false, uid: result.uid });
          }
        }).catch((err) => {
          reject(err);
        });
      });
    },
    goToLogin() {
      console.log(this.userInfo);
      if (this.login) {
        common_vendor.index.navigateTo({
          url: "../login/login?uid=" + this.userInfo._id + "&change=" + (this.userInfo.mobile ? "true" : "false")
        });
      } else {
        this.refreshUser("\u767B\u5F55\u6210\u529F").then((res) => {
          if (!res.bind) {
            common_vendor.index.navigateTo({
              url: "../login/login?uid=" + res.uid + "&change=false"
            });
          }
        }).catch((err) => {
          console.log(err);
          common_vendor.index.showToast({
            icon: "error",
            title: "\u670D\u52A1\u5668\u8BF7\u6C42\u9519\u8BEF"
          });
        });
      }
    }
  })
};
if (!Array) {
  const _easycom_cloud_image2 = common_vendor.resolveComponent("cloud-image");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_button2 = common_vendor.resolveComponent("uni-button");
  (_easycom_cloud_image2 + _easycom_uni_tag2 + _easycom_uni_button2)();
}
const _easycom_cloud_image = () => "../../components/cloud-image/cloud-image.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_button = () => "../../components/uni-button/uni-button.js";
if (!Math) {
  (_easycom_cloud_image + _easycom_uni_tag + _easycom_uni_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.userInfo.avatar
  }, _ctx.userInfo.avatar ? {
    b: common_vendor.p({
      src: _ctx.userInfo.avatar
    })
  } : {
    c: _imports_0
  }, {
    d: common_vendor.p({
      text: $options.identity[0],
      type: $options.identity[1]
    }),
    e: common_vendor.t(_ctx.userInfo.nickname),
    f: common_vendor.t($options.buttonText),
    g: common_vendor.o($options.goToLogin),
    h: common_vendor.p({
      bgcolor: "#FFFFFF00",
      bordcolor: "#FFFFFF",
      hovercolor: "#FFFFFF66"
    })
  });
}
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-57280228"], ["__file", "E:/\u4F5C\u4E1A/\u79D1\u521B/SRT/3D\u6253\u5370\u9884\u7EA6\u5C0F\u7A0B\u5E8F/SRT-Project/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
