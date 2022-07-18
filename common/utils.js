// 登录函数
function logIn() {
	// 正式代码
	return uni.login({
		"provider": "weixin",
		"onlyAuthorize": true
	}).then(res => { // 获取uniID
		console.log(res.code)
		return uniCloud.callFunction({
			name: 'uni-id-cf',
			data: {
				action: 'loginByWeixin',
				params: res.code
			}
		})
	})

	// 开发代码
	// uni.showLoading({
	// 	title: '登陆中',
	// 	mask: true
	// }).then(() => {
	// 	return ['user']
	// 	return ['admin1']
	// 	return ['admin2-1']
	// }).then(res => {
	// 	uni.setStorage({ // 将得到的openid存储到缓存里面方便后面调用
	// 		key: "cookie",
	// 		data: res[0]
	// 	})
	// }).catch(err => {
	// 	console.log(err)
	// 	uni.hideLoading()
	// 	uni.showToast({
	// 		title: '微信登录失败',
	// 		mask: true,
	// 		icon: 'error'
	// 	})
	// })
}

// 时间戳转通用时间
function changeTime(stamp) {
	let now = new Date();
	let diff = parseInt((now.getTime() - stamp) / 1000)
	if (diff < 60) {
		return diff + '秒前'
	} else if (diff < 3600) {
		return parseInt(diff / 60) + '分钟前'
	} else if (diff < 86400) {
		return parseInt(diff / 3600) + '小时前'
	} else if (diff < 259200) {
		return parseInt(diff / 86400) + '天前'
	} else if (diff < 378432000) {
		return parseInt(diff / 259200) + '月前'
	} else {
		return parseInt(diff / 378432000) + '年前'
	}
}

// 错误信息显示函数
function errInfo(res, title) {
	console.error(res)
	var t = ''
	if (res.data) t = res.data.errmsg
	uni.showToast({
		title: t || title,
		mask: true,
		icon: 'error'
	})
}
export default {
	logIn,
	errInfo,
	changeTime
}
