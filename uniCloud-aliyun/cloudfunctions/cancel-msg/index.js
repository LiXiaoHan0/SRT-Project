'use strict';
const db = uniCloud.database();
const $ = db.command.aggregate
exports.main = async (event, context) => {
	if(event.item.length==0){return 0}
	let {data} = await db.collection('srt-token').where({_id:'63c524f0e1a35ce43a673e24'}).get()
	// 将uid信息转换为openid信息
	let res = await db.collection('srt-appoint').aggregate().match({
		_id: $.in(event.item)
	}).project({
		date: true,
		uid: true,
		state: true
	}).lookup({
		from: 'uni-id-users',
		localField: 'uid',
		foreignField: '_id',
		as: 'openid'
	}).addFields({
		openid: $.arrayElemAt(['$openid', 0])
	}).addFields({
		openid: '$openid.wx_openid.mp-weixin'
	}).project({
		uid: false
	}).end()
	for(let i in res.data){
		let item=res.data[i]
		// if((item.state>>1)==1){
			await uniCloud.httpclient.request(
				`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${data[0].token}`, {
					method: 'POST',
					data: {
						template_id: '2oavjREU4Kvy_hp3YYsRhkGpDgqkmleueBoFf9J358Q',
						page: '/pages/index/index',
						touser: item.openid,
						data: {
							date2: {
								value: item.date
							},
							thing4: {
								value: event.log
							},
							thing9: {
								value: '预约已取消，如有疑问请联系管理员'
							}
						},
						miniprogram_state: 'trial'
					},
					contentType: 'json',
					dataType: 'json'
				})
		// }
	}
	await db.collection('srt-appoint').where({
		_id: db.command.in(event.item)
	}).remove();
	return res.data.length
};
