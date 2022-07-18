'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database();
	let res = await db.collection('srt-user').where({
		power: db.command.gt(0)
	}).field({"openid":false}).get();
	//返回符合条件的用户信息
	return {
		errCode: 0,
		errMsg: '查找成功',
		data: res.data
	}
};
