'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database();
	let res= await db.collection('srt-manage').where(event).field({day:false}).get()
	//返回数据给客户端
	return {
		errCode: 0,
		errMsg: '读取成功',
		data: res.data[0]
	}
};
