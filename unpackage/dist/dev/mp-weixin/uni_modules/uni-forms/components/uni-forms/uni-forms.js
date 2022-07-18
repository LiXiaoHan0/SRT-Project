"use strict";
var uni_modules_uniForms_components_uniForms_validate = require("./validate.js");
var common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "uniForms",
  components: {},
  emits: ["input", "reset", "validate", "submit"],
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    modelValue: {
      type: Object,
      default() {
        return {};
      }
    },
    rules: {
      type: Object,
      default() {
        return {};
      }
    },
    validateTrigger: {
      type: String,
      default: ""
    },
    labelPosition: {
      type: String,
      default: "left"
    },
    labelWidth: {
      type: [String, Number],
      default: ""
    },
    labelAlign: {
      type: String,
      default: "left"
    },
    errShowType: {
      type: String,
      default: "undertext"
    },
    border: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {}
    };
  },
  computed: {
    dataValue() {
      if (JSON.stringify(this.modelValue) === "{}") {
        return this.value;
      } else {
        return this.modelValue;
      }
    }
  },
  watch: {
    rules(newVal) {
      this.init(newVal);
    },
    labelPosition() {
      this.childrens.forEach((vm) => {
        vm.init();
      });
    }
  },
  created() {
    let getbinddata = getApp().$vm.$.appContext.config.globalProperties.binddata;
    if (!getbinddata) {
      getApp().$vm.$.appContext.config.globalProperties.binddata = function(name, value, formName) {
        if (formName) {
          this.$refs[formName].setValue(name, value);
        } else {
          let formVm;
          for (let i in this.$refs) {
            const vm = this.$refs[i];
            if (vm && vm.$options && vm.$options.name === "uniForms") {
              formVm = vm;
              break;
            }
          }
          if (!formVm)
            return console.error("\u5F53\u524D uni-froms \u7EC4\u4EF6\u7F3A\u5C11 ref \u5C5E\u6027");
          formVm.setValue(name, value);
        }
      };
    }
    this.unwatchs = [];
    this.childrens = [];
    this.inputChildrens = [];
    this.checkboxChildrens = [];
    this.formRules = [];
    this.init(this.rules);
  },
  methods: {
    init(formRules) {
      if (Object.keys(formRules).length === 0) {
        this.formData = this.dataValue;
        return;
      }
      this.formRules = formRules;
      this.validator = new uni_modules_uniForms_components_uniForms_validate.SchemaValidator(formRules);
      this.registerWatch();
    },
    registerWatch() {
      this.unwatchs.forEach((v) => v());
      this.childrens.forEach((v) => {
        v.init();
      });
      Object.keys(this.dataValue).forEach((key) => {
        let watch = this.$watch("dataValue." + key, (value) => {
          if (!value)
            return;
          if (value.toString() === "[object Object]") {
            for (let i in value) {
              let name = `${key}[${i}]`;
              this.formData[name] = this._getValue(name, value[i]);
            }
          } else {
            this.formData[key] = this._getValue(key, value);
          }
        }, {
          deep: true,
          immediate: true
        });
        this.unwatchs.push(watch);
      });
    },
    setRules(formRules) {
      this.init(formRules);
    },
    setValue(name, value, callback) {
      let example = this.childrens.find((child) => child.name === name);
      if (!example)
        return null;
      value = this._getValue(example.name, value);
      this.formData[name] = value;
      example.val = value;
      return example.triggerCheck(value, callback);
    },
    resetForm(event) {
      this.childrens.forEach((item) => {
        item.errMsg = "";
        const inputComp = this.inputChildrens.find((child) => child.rename === item.name);
        if (inputComp) {
          inputComp.errMsg = "";
          inputComp.is_reset = true;
          inputComp.$emit("input", inputComp.multiple ? [] : "");
          inputComp.$emit("update:modelValue", inputComp.multiple ? [] : "");
        }
      });
      this.childrens.forEach((item) => {
        if (item.name) {
          this.formData[item.name] = this._getValue(item.name, "");
        }
      });
      this.$emit("reset", event);
    },
    validateCheck(validate) {
      if (validate === null)
        validate = null;
      this.$emit("validate", validate);
    },
    async validateAll(invalidFields, type, keepitem, callback) {
      let childrens = [];
      for (let i in invalidFields) {
        const item = this.childrens.find((v) => v.name === i);
        if (item) {
          childrens.push(item);
        }
      }
      if (!callback && typeof keepitem === "function") {
        callback = keepitem;
      }
      let promise;
      if (!callback && typeof callback !== "function" && Promise) {
        promise = new Promise((resolve, reject) => {
          callback = function(valid, invalidFields2) {
            !valid ? resolve(invalidFields2) : reject(valid);
          };
        });
      }
      let results = [];
      let newFormData = {};
      if (this.validator) {
        for (let key in childrens) {
          const child = childrens[key];
          let name = child.isArray ? child.arrayField : child.name;
          if (child.isArray) {
            if (child.name.indexOf("[") !== -1 && child.name.indexOf("]") !== -1) {
              const fieldData = child.name.split("[");
              const fieldName = fieldData[0];
              const fieldValue = fieldData[1].replace("]", "");
              if (!newFormData[fieldName]) {
                newFormData[fieldName] = {};
              }
              newFormData[fieldName][fieldValue] = this._getValue(name, invalidFields[name]);
            }
          } else {
            newFormData[name] = this._getValue(name, invalidFields[name]);
          }
          const result = await child.triggerCheck(invalidFields[name], true);
          if (result) {
            results.push(result);
            if (this.errShowType === "toast" || this.errShowType === "modal")
              break;
          }
        }
      } else {
        newFormData = invalidFields;
      }
      if (Array.isArray(results)) {
        if (results.length === 0)
          results = null;
      }
      if (Array.isArray(keepitem)) {
        keepitem.forEach((v) => {
          newFormData[v] = this.dataValue[v];
        });
      }
      if (type === "submit") {
        this.$emit("submit", {
          detail: {
            value: newFormData,
            errors: results
          }
        });
      } else {
        this.$emit("validate", results);
      }
      callback && typeof callback === "function" && callback(results, newFormData);
      if (promise && callback) {
        return promise;
      } else {
        return null;
      }
    },
    submitForm() {
    },
    submit(keepitem, callback, type) {
      for (let i in this.dataValue) {
        const itemData = this.childrens.find((v) => v.name === i);
        if (itemData) {
          if (this.formData[i] === void 0) {
            this.formData[i] = this._getValue(i, this.dataValue[i]);
          }
        }
      }
      if (!type) {
        console.warn("submit \u65B9\u6CD5\u5373\u5C06\u5E9F\u5F03\uFF0C\u8BF7\u4F7F\u7528validate\u65B9\u6CD5\u4EE3\u66FF\uFF01");
      }
      return this.validateAll(this.formData, "submit", keepitem, callback);
    },
    validate(keepitem, callback) {
      return this.submit(keepitem, callback, true);
    },
    validateField(props, callback) {
      props = [].concat(props);
      let invalidFields = {};
      this.childrens.forEach((item) => {
        if (props.indexOf(item.name) !== -1) {
          invalidFields = Object.assign({}, invalidFields, {
            [item.name]: this.formData[item.name]
          });
        }
      });
      return this.validateAll(invalidFields, "submit", [], callback);
    },
    resetFields() {
      this.resetForm();
    },
    clearValidate(props) {
      props = [].concat(props);
      this.childrens.forEach((item) => {
        const inputComp = this.inputChildrens.find((child) => child.rename === item.name);
        if (props.length === 0) {
          item.errMsg = "";
          if (inputComp) {
            inputComp.errMsg = "";
          }
        } else {
          if (props.indexOf(item.name) !== -1) {
            item.errMsg = "";
            if (inputComp) {
              inputComp.errMsg = "";
            }
          }
        }
      });
    },
    _getValue(key, value) {
      const rules = this.formRules[key] && this.formRules[key].rules || [];
      const isRuleNum = rules.find((val) => val.format && this.type_filter(val.format));
      const isRuleBool = rules.find((val) => val.format && val.format === "boolean" || val.format === "bool");
      if (isRuleNum) {
        value = isNaN(value) ? value : value === "" || value === null ? null : Number(value);
      }
      if (isRuleBool) {
        value = !value ? false : true;
      }
      return value;
    },
    type_filter(format) {
      return format === "int" || format === "double" || format === "number" || format === "timestamp";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args)),
    b: common_vendor.o((...args) => $options.resetForm && $options.resetForm(...args)),
    c: !$props.border ? 1 : ""
  };
}
var Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "E:/\u4F5C\u4E1A/\u79D1\u521B/SRT/3D\u6253\u5370\u9884\u7EA6\u5C0F\u7A0B\u5E8F/SRT-Project/uni_modules/uni-forms/components/uni-forms/uni-forms.vue"]]);
wx.createComponent(Component);
