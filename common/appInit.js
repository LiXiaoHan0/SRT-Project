import store from '@/store'
const db = uniCloud.database()
export default async function() {
	//clientDB的错误提示
	function onDBError({
		code, // 错误码详见https://uniapp.dcloud.net.cn/uniCloud/clientdb?id=returnvalue
		message
	}) {
		console.log('onDBError', {
			code,
			message
		});
		// 处理错误
		console.error(code, message);
		if ([
				'TOKEN_INVALID_INVALID_CLIENTID',
				'TOKEN_INVALID',
				'TOKEN_INVALID_TOKEN_EXPIRED',
				'TOKEN_INVALID_WRONG_TOKEN',
				'TOKEN_INVALID_ANONYMOUS_USER'
			].includes(code)) {
			uni.reLaunch({
				url:'/pages/index/index'
			})
		}
	}
	// 绑定clientDB错误事件
	db.on('error', onDBError)

	// 解绑clientDB错误事件
	//db.off('error', onDBError)

	//拦截器封装callFunction
	let callFunctionOption;
	uniCloud.addInterceptor('callFunction', {
		async invoke(option) {
			if (option.name == 'uni-id-cf' && option.data.action.slice(0, 5) == 'login')
			{
				option.data.deviceInfo = await getDeviceInfo()
				console.log("重新登录/注册，获取设备id", option.data.deviceInfo);
			}
			// console.log(JSON.stringify(option));
			callFunctionOption = option
		},
		fail(e) { // 失败回调拦截
			console.error('网络请求错误码：',JSON.stringify(e));
			if (debug) {
				uni.showModal({
					content: JSON.stringify(e),
					showCancel: false
				});
				console.error(e);
			} else {
				uni.showModal({
					content: "系统错误请稍后再试！",
					showCancel: false,
					confirmText: "确定"
				});
			}
			//如果执行错误，检查是否断网
			uni.getNetworkType({
				complete: res => {
					// console.log(res);
					if (res.networkType == 'none') {
						uni.showToast({
							title: '手机网络异常',
							icon: 'none'
						});
						console.log('手机网络异常');
						let callBack = res => {
							console.log(res);
							if (res.isConnected) {
								uni.showToast({
									title: '恢复联网自动重新执行',
									icon: 'none'
								});
								console.log(res.networkType, "恢复联网自动重新执行");
								uni.offNetworkStatusChange(e => {
									console.log("移除监听成功", e);
								})
								//恢复联网自动重新执行
								uniCloud.callFunction(callFunctionOption)
								uni.offNetworkStatusChange(callBack);
							}
						}
						uni.onNetworkStatusChange(callBack);
					}
				}
			});
		},
		success: (e) => {
			const {
				token,
				tokenExpired
			} = e.result
			if (token && tokenExpired) {
				store.commit('user/login', {
					token,
					tokenExpired
				})
			}
			switch (e.result.code) {
				case 403:
					uni.reLaunch({
						url:'/pages/index/index'
					})
					break;
				case 30203:
					uni.reLaunch({
						url:'/pages/index/index'
					})
					break;
				case 50101:
					uni.showToast({
						title: e.result.msg,
						icon: 'none',
						duration: 2000
					});
					break;
				default:
					console.log('code的值是：' + e.result.code, '可以在上面添加case，自动处理响应体');
					break;
			}

			switch (e.result.errCode) {
				case 'uni-id-token-not-exist':
					uni.showToast({
						title: '登录信息失效',
						icon: 'none'
					});
					uni.reLaunch({
						url:"/pages/index/index"
					})
					break;
				default:
					break;
			}
		}
	})
}

// 获取设备信息
function getDeviceInfo() {
	let deviceInfo = {
		"uuid": '',
		"vendor": '',
		"push_clientid": '',
		"imei": '',
		"oaid": '',
		"idfa": '',
		"model": '',
		"platform": '',
	}
	const {
		model,
		platform,
	} = uni.getSystemInfoSync();
	Object.assign(deviceInfo, {
		model,
		platform
	});
	return deviceInfo
}