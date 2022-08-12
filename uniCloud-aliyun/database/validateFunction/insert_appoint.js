// 错误代码：
// '101': 预约了已经过去的时间
// '102': 预约冲突，可能是已经被人预约了
module.exports = function(rule, value, data, callback) {
	// rule  当前规则
	// value 当前规则校验数据
	// data  全部校验数据
	// callback 可选，一般用于自定义 errorMessage，如果执行了callback return 值无效，callback 传入的 message 将替换 errorMessage
	// callback('message') 传入错误消息时校验不通过
	// callback() 无参时通过
	// 注意 callback 不支持异步调用，异步请使用 Promise/await/async
	const day = new Date()
	if(value.date==day.toISOString().slice(0, 10)){
		let time=day.getHours()+parseInt(day.getMinutes()/30)+1
		if(time>value.start){callback('101')}
	}
	const db=uniCloud.database()
	let res=await db.collection('srt-appoint').where({
		date:value.date
	}).get()
	console.log(res)
	callback('102')
}