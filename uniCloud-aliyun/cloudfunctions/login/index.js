'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database();
	let res = await db.collection('srt-user').where(event).get()
	//返回用户详细信息
	if (res.data.length>0) {
		return {
			errCode: 0,
			errMsg: '登录成功',
			data: res.data
		}
	} else {
		return {
			errCode: 'no-data',
			errMsg: '未进行授权'
		}
	}
};
