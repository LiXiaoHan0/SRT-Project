// 标准时间格式转化
const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	// const hour = date.getHours()
	// const minute = date.getMinutes()
	// const second = date.getSeconds()
	
	// return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
	return [year, month, day].map(formatNumber).join('-')
}
	
const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}
	
// 时间戳转通用时间
const changeTime= stamp=> {
	if(typeof(stamp)=='undefined') return '无法确定'
	let now = new Date();
	let diff = parseInt((now.getTime() - stamp) / 1000)
	if (diff < 60) {
		return diff + '秒前'
	} else if (diff < 3600) {
		return parseInt(diff / 60) + '分钟前'
	} else if (diff < 86400) {
		return parseInt(diff / 3600) + '小时前'
	} else if (diff < 2592000) {
		return parseInt(diff / 86400) + '天前'
	} else if (diff < 31536000) {
		return parseInt(diff / 2592000) + '月前'
	} else {
		return parseInt(diff / 31536000) + '年前'
	}
}

// 数字代码转时间点
const numtoTime = t => {
	let h = parseInt(t / 2)
	if (t % 2 == 1) {
		return (h <= 9 ? '0' : '') + h + ':30'
	} else {
		return (h <= 9 ? '0' : '') + h + ':00'
	}
}

// 通用报错模板
const errReport= err=>{
	console.log(err)
	uni.hideLoading()
	uni.showToast({
		icon: 'error',
		title: '服务器请求错误',
		mask: true
	})
}

export default {
	formatNumber,
	formatTime,
	changeTime,
	numtoTime,
	errReport
}
