'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	let {data} = await uniCloud.httpclient.request('https://api.weixin.qq.com/cgi-bin/token', {
		data: {
			grant_type: 'client_credential',
			appid: "填写来源微信开放平台https://mp.weixin.qq.com/创建的小程序的appid",
        	secret: "填写来源微信开放平台https://mp.weixin.qq.com/创建的小程序的appsecret"
		},
		contentType: 'json',
		dataType: 'json'
	})
	// 修改数据库中的token记录
	return await db.collection('srt-token').doc('63c524f0e1a35ce43a673e24').update({token:data.access_token})
};
