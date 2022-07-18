'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database();
	let res0 = await db.collection('srt-manage').where({
		day: event.day
	}).field({
		_id: true,
		occupy: true
	}).get()
	if (res0.affectedDocs == 0) { //尚未分配管理人
		return{
			errCode: 'no-manager',
			errMsg: '当天未分配管理员',
		}
		// 若可以预约未分配管理员的日期
		// await db.collection('srt-manage').add({
		// 	uno: "",
		// 	eno: event.eno,
		// 	day: event.day,
		// 	occupy: event.appoint
		// })
	} else { // 已分配管理员
		if ((res0.data[0].occupy[event.eno] & event.appoint) > 0) {
			return {
				errCode: 'forbid-time',
				errMsg: '预约时间冲突'
			}
		} else {
			let tmp={}
			tmp[event.eno]=res0.data[0].occupy[event.eno] + event.appoint
			await db.collection('srt-manage').doc(res0.data[0]._id).update({
				occupy:tmp
			})
		}
	}
	let res = await db.collection('srt-appoint').add(event)
	if (res.id) {
		return {
			errCode: 0,
			errMsg: '预约成功',
		}
	}
};
