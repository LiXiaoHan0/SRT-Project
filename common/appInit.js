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
				// console.log("重新登录/注册，获取设备id", option.data.deviceInfo);
			}
			// console.log(JSON.stringify(option));
			callFunctionOption = option
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