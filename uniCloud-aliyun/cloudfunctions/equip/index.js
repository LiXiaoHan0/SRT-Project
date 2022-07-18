'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database();
	let res = await db.collection('srt-equip').get();
	//是否需要返回当前状态？
	//返回所有设备信息
	return {
		errCode: 0,
		errMsg: '信息读取成功',
		data: res.data
	}
};
