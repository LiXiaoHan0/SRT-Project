'use strict';
const db = uniCloud.database();
const $ = db.command.aggregate
exports.main = async (event, context) => {
	let {data} = await db.collection('srt-token').where({_id:'63c524f0e1a35ce43a673e24'}).get()
	// 将服务器本地时间转换为北京时间
	const time = new Date
	const ch_time = new Date(time.getTime()+time.getTimezoneOffset()*60000+28800000)
	let res = await db.collection('srt-appoint').aggregate().match({
		date: ch_time.toISOString().slice(0, 10),
		start: 2 * ch_time.getHours() + 2,
		state: 1
	}).project({
		uid: true,
		start: $.divide(['$start',2]),
		end: $.divide(['$end',2])
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
		await uniCloud.httpclient.request(
			`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${data[0].token}`, {
				method: 'POST',
				data: {
					template_id: '565SlmswFgNuEezLZ1Mnd4UbHgL4cgwhpfSxaUlKciw',
					page: `/pages/show/show?type=appoint&text=预约详细信息&id=${item._id}`,
					touser: item.openid,
					data: {
						date3: {
							value: `${(item.start<10?'0':'')+item.start}:00~${item.end}:00`
						},
						thing2: {
							value: '李兆基科技大楼A305'
						},
						thing8: {
							value: '预约即将开始，请准时前往实验室'
						}
					},
					miniprogram_state: 'trial'
				},
				contentType: 'json',
				dataType: 'json'
			})
	}
};
