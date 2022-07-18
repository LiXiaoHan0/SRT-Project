'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database();
	let res = await db.collection('srt-user').doc(event.id).update({
		power:event.power
	});
	//返回更新成功的条数
	if (res.updated>0) {
		return {
			errCode: 0,
			errMsg: '权限调整成功'
		}
	} else {
		return {
			errCode: 'no-user',
			errMsg: '用户不存在'
		}
	}
};
