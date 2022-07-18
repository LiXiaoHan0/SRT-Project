"use strict";
var common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "cloud-image",
  emits: ["click", "switchChange"],
  props: {
    mode: {
      type: String,
      default() {
        return "widthFix";
      }
    },
    src: {
      default() {
        return "";
      }
    },
    width: {
      type: String,
      default() {
        return "80px";
      }
    },
    height: {
      type: String,
      default() {
        return "80px";
      }
    }
  },
  watch: {
    src: {
      handler(src) {
        if (src && src.substring(0, 8) == "cloud://") {
          common_vendor.tn.getTempFileURL({
            fileList: [src]
          }).then((res) => {
            this.cSrc = res.fileList[0].tempFileURL;
          });
        } else {
          this.cSrc = src;
        }
      },
      immediate: true
    }
  },
  async mounted() {
  },
  methods: {
    onClick() {
      this.$emit("click");
    }
  },
  data() {
    return {
      cSrc: false
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.cSrc
  }, $data.cSrc ? {
    b: $props.width,
    c: $props.height,
    d: $data.cSrc,
    e: $props.mode
  } : {}, {
    f: common_vendor.o((...args) => $options.onClick && $options.onClick(...args)),
    g: $props.width,
    h: $props.height
  });
}
var Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "E:/\u4F5C\u4E1A/\u79D1\u521B/SRT/3D\u6253\u5370\u9884\u7EA6\u5C0F\u7A0B\u5E8F/SRT-Project/components/cloud-image/cloud-image.vue"]]);
wx.createComponent(Component);
