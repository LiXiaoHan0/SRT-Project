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
let userId = null;
const defaultUrl = "../../static/grey.jpg";
const CloudUrl = "3fb0c0dd-0642-4372-acb5-e48e25112ffa";
const _sfc_main = {
  data() {
    return {
      loginData: {
        nickname: "",
        avatar: defaultUrl,
        mobile: "",
        in_campu: null,
        school_id: "",
        role: ["USER"]
      },
      identity: [{
        "value": 1,
        "text": "\u6821\u5185\u5E08\u751F"
      }, {
        "value": 0,
        "text": "\u6821\u5916\u4EBA\u5458"
      }],
      rules: {
        nickname: {
          rules: [{
            required: true,
            errorMessage: "\u8BF7\u586B\u5199\u59D3\u540D"
          }, {
            minLength: 2,
            maxLength: 5,
            errorMessage: "\u59D3\u540D\u957F\u5EA6\u5E94\u5728 {minLength} \u5230 {maxLength} \u4E2A\u5B57\u7B26"
          }]
        },
        mobile: {
          rules: [{
            required: true,
            errorMessage: "\u8BF7\u586B\u5199\u7535\u8BDD\u53F7\u7801"
          }, {
            minLength: 11,
            maxLength: 11,
            errorMessage: "\u7535\u8BDD\u53F7\u7801\u957F\u5EA6\u5E94\u4E3A11\u4F4D"
          }]
        },
        in_campu: {
          rules: [{
            required: true,
            errorMessage: "\u8BF7\u9009\u62E9\u8EAB\u4EFD"
          }]
        },
        school_id: {
          rules: [{
            required: true,
            errorMessage: "\u8BF7\u586B\u5199\u5B66\u53F7/\u5DE5\u53F7"
          }, {
            minLength: 10,
            maxLength: 10,
            errorMessage: "\u5B66\u53F7/\u5DE5\u53F7\u957F\u5EA6\u5E94\u4E3A10\u4F4D"
          }]
        }
      }
    };
  },
  computed: __spreadValues({}, common_vendor.mapGetters({
    userInfo: "user/info"
  })),
  methods: __spreadProps(__spreadValues({}, common_vendor.mapMutations({
    setUserInfo: "user/login"
  })), {
    onChooseAvatar({ detail }) {
      if (detail.avatarUrl) {
        console.log("\u9009\u62E9\u5934\u50CF", detail.avatarUrl);
        this.loginData.avatar = detail.avatarUrl;
      }
    },
    submitForm(e) {
      this.$refs.infoForm.validate(["avatar", "role"]).then((formData) => {
        delete formData.in_campu;
        if (formData.avatar === defaultUrl) {
          common_vendor.index.showModal({
            title: "\u63D0\u793A",
            content: "\u786E\u8BA4\u8981\u4F7F\u7528\u9ED8\u8BA4\u5934\u50CF\u5417\uFF1F"
          }).then((res) => {
            if (res.confirm) {
              this.uploadInfo(formData);
            }
          });
        } else {
          this.uploadInfo(formData);
        }
      }).catch((err) => {
        console.log("\u6821\u9A8C\u9519\u8BEF", err);
      });
    },
    uploadInfo(detail) {
      common_vendor.index.showLoading({ mask: true });
      let cloudPath = userId + "/" + Date.now() + "avatarUrl.jpg";
      new Promise((resolve, reject) => {
        if (this.loginData.avatar === defaultUrl) {
          resolve({
            fileID: CloudUrl
          });
        } else {
          common_vendor.index.downloadFile({
            url: this.loginData.avatar
          }).then((res) => {
            if (res.statusCode === 200) {
              console.log(res.tempFilePath);
              common_vendor.tn.uploadFile({
                filePath: res.tempFilePath,
                cloudPath,
                fileType: "image",
                success: (res2) => {
                  resolve(res2);
                },
                fail: (err) => {
                  reject(err);
                }
              });
            } else {
              reject(res);
            }
          });
        }
      }).then((result) => {
        let data = Object.assign({}, detail, {
          avatar: result.fileID
        });
        console.log("\u4E0A\u4F20\u6210\u529F", data);
        const db = common_vendor.tn.database();
        const usersTable = db.collection("uni-id-users");
        return usersTable.where('_id=="' + userId + '"').update(data).then((res) => {
          console.log(res);
          this.setUserInfo(data);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "\u4FE1\u606F\u63D0\u4EA4\u6210\u529F",
            icon: "success",
            complete: common_vendor.index.navigateBack()
          });
        });
      }).catch((err) => {
        console.log(err);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: err.message || "\u8BF7\u6C42\u670D\u52A1\u5931\u8D25",
          icon: "error"
        });
      });
    }
  }),
  onLoad(e) {
    userId = e.uid;
    let data = this.userInfo;
    if (e.change) {
      this.loginData = {
        nickname: data.nickname,
        avatar: data.avatar,
        mobile: data.mobile,
        in_campu: data.school_id ? 1 : 0,
        school_id: data.school_id || "",
        role: data.role
      };
    }
  }
};
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_uni_button2 = common_vendor.resolveComponent("uni-button");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _easycom_uni_forms2 + _easycom_uni_button2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_uni_button = () => "../../components/uni-button/uni-button.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_forms + _easycom_uni_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loginData.avatar,
    b: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args)),
    c: common_vendor.o(($event) => $data.loginData.nickname = $event),
    d: common_vendor.p({
      type: "text",
      placeholder: "\u8BF7\u8F93\u5165\u59D3\u540D",
      modelValue: $data.loginData.nickname
    }),
    e: common_vendor.p({
      required: true,
      label: "\u59D3\u540D",
      name: "nickname"
    }),
    f: common_vendor.o(($event) => $data.loginData.mobile = $event),
    g: common_vendor.p({
      type: "number",
      placeholder: "\u8BF7\u8F93\u5165\u7535\u8BDD\u53F7\u7801",
      modelValue: $data.loginData.mobile
    }),
    h: common_vendor.p({
      required: true,
      label: "\u7535\u8BDD",
      name: "mobile"
    }),
    i: common_vendor.o(($event) => $data.loginData.in_campu = $event),
    j: common_vendor.p({
      selectedColor: "#660874",
      localdata: $data.identity,
      modelValue: $data.loginData.in_campu
    }),
    k: common_vendor.p({
      required: true,
      label: "\u8EAB\u4EFD",
      name: "in_campu"
    }),
    l: $data.loginData.in_campu
  }, $data.loginData.in_campu ? {
    m: common_vendor.o(($event) => $data.loginData.school_id = $event),
    n: common_vendor.p({
      type: "number",
      placeholder: "\u8BF7\u8F93\u5165\u5B66\u53F7/\u5DE5\u53F7",
      modelValue: $data.loginData.school_id
    }),
    o: common_vendor.p({
      required: true,
      label: "\u5B66\u53F7/\u5DE5\u53F7",
      name: "school_id"
    })
  } : {}, {
    p: common_vendor.sr("infoForm", "b237504c-0"),
    q: common_vendor.p({
      modelValue: $data.loginData,
      rules: $data.rules
    }),
    r: common_vendor.o($options.submitForm)
  });
}
var MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b237504c"], ["__file", "E:/\u4F5C\u4E1A/\u79D1\u521B/SRT/3D\u6253\u5370\u9884\u7EA6\u5C0F\u7A0B\u5E8F/SRT-Project/pages/login/login.vue"]]);
wx.createPage(MiniProgramPage);
