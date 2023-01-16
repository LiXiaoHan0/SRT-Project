'use strict';
// 错误代码：
// 100: 预约成功
// 101: 预约了已经过去的时间
// 102: 预约冲突，可能是已经被人预约了
// 103: 其他不可知错误
const db=uniCloud.database()
const dbCmd = db.command
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	if(event.value.date==event.time.today && event.value.start<=event.time.hour){
		return 101
	}
	let res=await db.collection('srt-appoint').where({
		eid:event.value.eid,
		date:event.value.date,
		start:dbCmd.lt(event.value.end),
		end:dbCmd.gt(event.value.start)
	}).get()
	if(res.data.length==0){
		let ans= await db.collection('srt-appoint').add(event.value)
		if(ans.id) return 100
	} else{
		return 102
	}
	return 103
};