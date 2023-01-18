# SRT-Project
服务于实验室设备预约的微信小程序

## 开发配置

+ 前端：uniapp，参考https://uniapp.dcloud.net.cn/
+ 后端：uniCloud-aliyun，参考https://uniapp.dcloud.net.cn/uniCloud/

尝试运行前请确保已经安装**微信开发者工具**，并在**HBuilder X**中完成相关配置

## 快速部署

1. 在[微信公众平台](https://mp.weixin.qq.com/)注册微信小程序并获得AppID与AppSecret，并添加以下服务器域名：
   + request：https://api.next.bspapp.com;https://tcb-api.tencentcloudapi.com
   + upload：https://cos.ap-shanghai.myqcloud.com
2. 克隆项目，并修改以下目录中的AppID与AppSecret：
   + uniCloud-aliyun/cloudfunctions/get-token/
   + uni_modules/uni-config-center/
3. 在[uniCloud](https://unicloud.dcloud.net.cn)平台创建服务器空间，并在Hbuilder X中关联服务空间，上传并部署所有云函数/云对象和数据库配置。
4. 运行到小程序模拟器体验功能。

## 分支说明

+ main：完整版，提供所有已开发功能
+ simple：简化版，删减了设备相关功能：
  + 用户无法实时查看各个设备预约情况
  + 用户无法针对具体设备进行预约
  + 系统无法对预约时间进行冲突检查
  + 管理员无法查看用户预约的具体设备