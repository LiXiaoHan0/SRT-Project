'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database();
	let res0 = await db.collection('srt-manage').where({
		day: event.day
	}).field({
		"_id": true
	}).get();
	// 分情况调整管理人
	if (res0.data.length > 0) {
		let res = await db.collection('srt-manage').doc(res0.data[0]._id).update({
			uno: event.uno
		});
		if (res.updated > 0) {
			return {
				errCode: 0,
				errMsg: '分配成功'
			}
		}
	} else {
		let tmp=await db.collection('srt-equip').field({_id:true}).get()
		let occupy0={}
		for(let i=0;i<tmp.data.length;i++){
			occupy0[tmp.data[i]._id]=16383
		}
		let res = await db.collection('srt-manage').add({
			uno: event.uno,
			day: event.day,
			occupy: occupy0
		});
		if (res.id) {
			return {
				errCode: 0,
				errMsg: '分配成功'
			}
		}
	}
};
