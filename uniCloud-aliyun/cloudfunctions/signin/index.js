'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database();
	let res = await db.collection('srt-user').add(event)
	//返回用户序号id
	if (res.id) {
		return {
			errCode: 0,
			errMsg: '注册成功',
			data: res.id
		}
	}
};
