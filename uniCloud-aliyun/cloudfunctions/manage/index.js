'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const db = uniCloud.database();
	
	//返回数据给客户端
	return {
		errCode: 0,
		errMsg: '登录成功',
		data: res.data
	}
};
