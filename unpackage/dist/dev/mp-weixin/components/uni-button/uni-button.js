"use strict";
var common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "uni-button",
  data() {
    return {};
  },
  props: {
    type: {
      type: String,
      default: "normal"
    },
    bgcolor: {
      type: String,
      default: "#660874"
    },
    bordcolor: {
      type: String,
      default: "#ffffff00"
    },
    hovercolor: {
      type: String,
      default: "#D93379"
    }
  },
  computed: {
    parameter() {
      const parameter = {
        "--bg-color": this.bgcolor,
        "--hover-color": this.hovercolor,
        "--bord-color": this.bordcolor
      };
      switch (this.type) {
        case "green":
          parameter["--bg-color"] = "#00BF00";
          parameter["--hover-color"] = "#008C00";
          break;
        case "red":
          parameter["--bg-color"] = "#EB3341";
          parameter["--hover-color"] = "#B82834";
          break;
        case "blue":
          parameter["--bg-color"] = "#009FFF";
          parameter["--hover-color"] = "#007ECC";
          break;
      }
      return parameter;
    }
  },
  emits: ["click"],
  methods: {
    press(e) {
      this.$emit("click", e);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.s($options.parameter),
    b: common_vendor.o((...args) => $options.press && $options.press(...args))
  };
}
var Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f2d01f38"], ["__file", "E:/\u4F5C\u4E1A/\u79D1\u521B/SRT/3D\u6253\u5370\u9884\u7EA6\u5C0F\u7A0B\u5E8F/SRT-Project/components/uni-button/uni-button.vue"]]);
wx.createComponent(Component);
