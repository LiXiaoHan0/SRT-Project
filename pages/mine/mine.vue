<template>
	<!-- 权限为普通用户 -->
	<view v-if="role=='USER'">
		<uni-card v-for="item in userData" :key="item._id" :title="item.title" :extra="'点击查看详情'" @click="goAppoint(item._id)">
			<text>预约日期：{{item.date}}\n预约时间：{{realTime(item)}}\n预约地点：李兆基科技大楼A305</text>
		</uni-card>
		<view class="col-flex no-more">没有更多数据了</view>
	</view>
	<!-- 权限为管理员 -->
	<view v-else-if="role=='AUDITOR'" style="padding-top:100px;">
		<!-- 选择日期 -->
		<uni-icons class="date-picker" type="calendar" size="28" color="#000" @click="openCalendar"></uni-icons>
		<uni-calendar ref="calendar" :clear-date="false" :date="today" :insert="false" :startDate="dateInfo.start"
		 :endDate="dateInfo.end" :selected="message" :range="false" @confirm="confirmDate" />
		<!-- 本日概况 -->
		<uni-section class="top-info" :title="title+'预约概况：'" type="line">
			<view class="row-flex">
				<view v-for="item in auditBar" class="row-flex" :key="item[0]" style="width:50%">
					<text class="top-text">{{item[0]}}</text>
					<view class="top-circle">{{item[1]}}</view>
				</view>
			</view>
		</uni-section>
		<view style="height:40px;"></view>
		<uni-card v-for="item in auditData" :key="item._id" :title="item.title" :extra="'点击查看详情'" @click="goAppoint(item._id)">
			<text>预约用户：{{item.uid[0].nickname}}\n指导教师：{{item.teacher}}\n预约时间：{{realTime(item)}}</text>
		</uni-card>
		<view class="col-flex no-more">没有更多数据了</view>
	</view>
	<!-- 权限为超级管理员 -->
	<view v-else-if="role=='admin'" style="margin-top:48px">
		<uni-tabs :tabnav="tabnav" @click="refreshAdminData"></uni-tabs>
		<!-- 用户权限管理 -->
		<view v-show="tabinx==0">
			<uni-collapse accordion>
				<uni-collapse-item v-for="(title,i) in ['超级管理员列表','管理员列表']" :key="i" :title="title">
					<uni-list>
						<uni-list-item v-for="item in adminData1[i].data" :key="item._id" 
						:title="item.nickname" :note="'最后登陆时间：'+changeTime(item.last_login_date)" 
						:thumb="item.avatar" thumb-size="lg" rightText="详细信息" 
						showArrow clickable @click="goProfile(item._id,i)" />
					</uni-list>
				</uni-collapse-item>
			</uni-collapse>
			<view style="margin: 30px 60px">
				<uni-button @click="goSearch">
					<uni-icons type="plus" size="18" color="#fff"/>
					<text> 设置新的管理员</text>
				</uni-button>			
			</view>
		</view>
		<!-- 开放时间管理 -->
		<view v-show="tabinx==1">
			<uni-dates ref="dates" @changeMonth="changeMonth" @changeState="changeState"></uni-dates>
			<!-- <uni-calendar ref="calendar" :startDate="today" :endDate="nextday" :range="true" :selected="calendarInfo" :insert="true" @change="changeDate"/>
			<view v-show="range" class="row-flex" style="justify-content:space-around;margin:12px;">
				<uni-button type="green" @click="openTime(adminData2)">开放时间段</uni-button>
				<uni-button type="red" @click="closeTime(adminData2)">关闭时间段</uni-button>
			</view> -->
		</view>
	</view>
	<!-- <uni-fab v-if="role=='AUDITOR' || role=='admin'" :pattern="pattern" :content="content" @trigger="trigger" /> -->
</template>

<script>
	const db = uniCloud.database()
	import {
		mapGetters
	} from 'vuex';
	import utils from '../../common/utils.js'
	export default {
		data() {
			return {
				role:null,
				today:null,
				nextday:null,
				
				// 废弃显示方案
				// pattern:{
				// 	color:'#660874',
				// 	buttonColor:'#660874'
				// },
				// content:[{
				// 	iconPath:'/static/fab/equip.png',
				// 	text:'设备',
				// 	url:'../operate/operate'
				// },{
				// 	iconPath:'/static/fab/chart.png',
				// 	text:'统计',
				// 	url:'../statistic/statistic'
				// }],
				
				// 用户数据
				userData:[],
				// 管理员数据
				auditData:[],
				title:'今日',
				message:[],
				dateInfo:{start:'',end:''},
				// 超级管理员数据
				lock:true,
				tabinx:0,
				tabnav:[{type:0,name:'用户权限管理'},
						{type:1,name:'开放时间管理'}],
				adminData1:[{data:[]},{data:[]}],
				adminData2:[]
			};
		},
		computed:{
			...mapGetters({
				userInfo: 'user/info'
			}),
			auditBar(){
				let data=this.auditData
				let ans='暂无',now=new Date()
				let h=now.getHours(),m=now.getMinutes()
				if(this.today==this.dateInfo.start){
					for(let item of data){
						if(item.start>>1>h){
							ans='<'+((item.start-parseInt(m/30))/2-h)+'h'
							break
						}
					}
				}
				return [['本日\n预约\n总计',data.length+'次'],['距离\n下次\n预约',ans]]
			},
			// calendarInfo(){
			// 	let data=this.adminData2,tmp=[]
			// 	if(data.length && data[0].start<this.today) data[0].start=this.today
			// 	for(let i in data){
			// 		for(let j=new Date(data[i].start);j<=new Date(data[i].end);j.setDate(j.getDate()+1)){
			// 			tmp.push({
			// 				date: utils.formatTime(j),
			// 				info: '未开放'
			// 			})
			// 		}
			// 	}
			// 	return tmp
			// }
		},
		onLoad() {
			let tmp1=new Date()
			let tmp2=new Date(tmp1)
			tmp2.setDate(tmp1.getDate()+30)
			this.today=utils.formatTime(tmp1)
			this.nextday=utils.formatTime(tmp2)
		},
		onShow() {
			let tmp=this.userInfo.role[0]
			if(tmp) this.role=tmp
			this.refresh()
		},
		onPullDownRefresh() {
			this.refresh()
		},
		methods:{
			refresh(){
				console.log(this.role)
				switch(this.role){
					case 'USER':
						this.refreshUserData()
						break
					case 'AUDITOR':
						this.refreshAuditData()
						break
					case 'admin':
						this.refreshAdminData(this.tabinx)
						break
					default:
						uni.showToast({
							icon:'error',
							title:'请先完成登录'
						})
				}
			},
			// 刷新用户数据
			refreshUserData(){
				uni.showLoading({mask:true})
				db.collection('srt-appoint').where(`date>="${utils.formatTime(new Date())}" && uid=="${uniCloud.getCurrentUserInfo().uid}"`)
				.field('title,start,end,date').orderBy('date desc, start desc, end desc').get().then(({result})=>{
					console.log(result)
					this.userData=result.data
					uni.hideLoading()
				}).catch(err => {
					utils.errReport(err)
				})
			},
			// 刷新管理员数据
			refreshAuditData(){
				uni.showLoading({mask:true})
				let now=new Date()
				this.dateInfo={
					start:utils.formatTime(now),
					end:utils.formatTime(new Date(now.setDate(now.getDate()+6)))
				}
				const tmp1=db.collection('srt-appoint').where(`date=="${this.today}"`).field('title,start,end,uid,teacher').getTemp()
				const tmp2=db.collection('uni-id-users').field('_id,nickname').getTemp()
				db.collection(tmp1,tmp2).orderBy('start asc,end asc').get().then(({result})=>{
					console.log(result)
					this.auditData=result.data
					uni.hideLoading()
				}).catch(err => {
					utils.errReport(err)
				})
			},
			// 刷新超级管理员数据
			refreshAdminData(e){
				this.tabinx=e
				switch(e){
					case 0:
						this.refreshPower()
						break
					case 1:
						this.changeMonth(this.$refs.dates.now)
						break
				}
			},
			// 刷新管理权限数据
			refreshPower(){
				uni.showLoading({mask:true})
				const getAudit = db.collection('uni-id-users').where('role[0]=="admin"').field('nickname,avatar,last_login_date').getTemp()
				const getAdmin = db.collection('uni-id-users').where('role[0]=="AUDITOR"').field('nickname,avatar,last_login_date').getTemp()
				db.multiSend(getAudit,getAdmin).then(({result})=>{
					console.log(result)
					this.adminData1=result.dataList
					uni.hideLoading()
				}).catch(err => {
					utils.errReport(err)
				})
			},
			// 刷新禁用时间数据
			// refreshTime(y_m){
			// 	uni.showLoading({mask:true})
			// 	db.collection('srt-occupy').where(`y_m="${y_m}"`).field('day').distinct().get().then(({result})=>{
			// 		this.adminData2=result.data
			// 		uni.hideLoading()
			// 	}).catch(err => {
			// 		utils.errReport(err)
			// 	})
			// },
			// 重新选择日历时间
			changeMonth({y,m}){
				uni.showLoading({mask:true})
				db.collection('srt-occupy').where(`y_m=="${y}-${(m<10?'0':'')+m}"`).field('day').distinct().get().then(({result})=>{
					if(result.data.length) 
						this.$refs.dates.refreshState(result.data[0].day)
					else
						this.$refs.dates.refreshState(0)
					uni.hideLoading()
				}).catch(err => {
					utils.errReport(err)
				})
			},
			// 更改日历开放时间
			changeState({y,m},state,backup){
				uni.showLoading({mask:true})
				const y_m=y+'-'+(m<10?'0':'')+m
				db.collection('srt-occupy').where(`y_m=="${y_m}"`).update({day:state}).then(({result})=>{
					console.log(result)
					this.$refs.dates.refreshState(state)
					uni.hideLoading()
					uni.showToast({
						icon:'success',
						title:'修改成功'
					})
					this.sendMessage(((state^backup)&state)>>1,y_m)
				}).catch(err => {
					utils.errReport(err)
				})
			},
			// 通知预约取消
			sendMessage(t,y_m){
				let i=1,dates=[]
				while(t>0){
					if(t&1) dates.push(y_m+(i<10?'-0':'-')+i)
					t=t>>1;++i
				}
				console.log('date in ["'+dates.join('","')+'"]')
				db.collection('srt-appoint').where('date in ["'+dates.join('","')+'"]').field('_id').get().then(({result})=>{
					let tmp=[]
					for(i of result.data) tmp.push(i._id)
					uniCloud.callFunction({
						name: 'cancel-msg',
						data: {
							item:tmp,
							log:'设备临时关闭开放'
						}
					})
				})
			},
			// 设置开放时间段
			// openTime(e){
				// uni.showLoading({mask:true})
				// let i=0,l=e.length,tmp=[]
				// let a=this.range.before,b=this.range.after
				// while(i<l && (e[i].end<a || e[i].start>b)) i++
				// if(i<l){
				// 	if(e[i].end>b){
				// 		if(e[i].start<a){
				// 			tmp.push(db.collection('srt-occupy').where(`start=='${e[i].start}'`).update({end:a}))
				// 		}else if(e[i].start<=b){
				// 			tmp.push()
				// 		}
				// 	} else{
				// 		if(e[i].start<a){
				// 			tmp.push()
				// 		}else{
				// 			tmp.push()
				// 		}
				// 	}
				// }
				// while(i<l && e[i].end<=b){
				// 	tmp.push(db.collection('srt-occupy').where(`start=='${e[i].start}'`).remove())
				// 	i++
				// }
				// if(i<l){
				// 	if(e[i].start<=b){
				// 		tmp.push()
				// 	}
				// }
				// Promise.all(tmp).then(()=>{
				// 	uni.hideLoading()
				// 	uni.showToast({
				// 		icon:'success',
				// 		title:'时间段设置成功'
				// 	})
				// }).catch(err=>{
				// 	utils.errReport(err)
				// })
			// },
			// 设置关闭时间段
			// closeTime(e){
				
			// },
			// 跳转至预约详细信息
			goAppoint(id){
				uni.navigateTo({
					url:`../show/show?type=appoint&text=预约详细信息&id=${id}`+(this.role=='USER'?'&item=取消预约':'')
				})
			},
			// 跳转至个人详细信息
			goProfile(id,t){
				uni.navigateTo({
					url:`../show/show?type=profile&text=用户详细信息&id=${id}`+(t==0?'':'&item=解除权限')
				})
			},
			// 跳转至管理员设置
			goSearch(){
				uni.navigateTo({
					url:'../search/search'
				})
			},
			// 时间处理函数
			changeTime(t){
				return utils.changeTime(t)
			},
			realTime(data){
				return (utils.numtoTime(data.start)+'~'+utils.numtoTime(data.end))
			},
			// 日历相关函数
			openCalendar(){
				uni.showLoading({mask:true})
				db.collection('srt-appoint').where(`date>="${this.dateInfo.start}" && date<="${this.dateInfo.end}"`).groupBy('date').groupField('count(*) as sum').orderBy('date asc').get().then(({result})=>{
					console.log(result)
					this.message=result.data.map(item=>{
						return {
							date:item.date,
							info:'有预约'
						}
					})
					this.$refs.calendar.open()
					uni.hideLoading()
				}).catch(err=>{
					utils.errReport(err)
				})
			},
			confirmDate(e){
				console.log('confirm 返回:', e)
				this.today=e.fulldate
				this.title=e.fulldate==this.dateInfo.start?'今日':(parseInt(e.month)+'月'+parseInt(e.date)+'日')
				this.refresh()
			},
			// 跳转至扩展功能
			// trigger(e) {
			// 	uni.navigateTo({
			// 		url:this.content[e.index].url
			// 	})
			// }
		}
	}
</script>

<style lang="scss" scoped>
	.top-info{
		top: -10px;
		z-index: 1;
		width: 95%;
		padding: 0 5% 10px 0;
		position: fixed;
		background-color:#fff;
		box-shadow: 0px 0px 3px 2px rgba(0, 0, 0, 0.08);
	}
	.top-text{
		width: 50%;
		padding:10px 5px 10px 0;
		font: 500 14px/20px $body-font-family;
		text-align: center;
	}
	.top-circle{
		width: 60px;
		height: 60px;
		border-radius: 50%;
		text-align: center;
		border: $tsinghua3 solid 3px;
		font: 500 20px/60px $body-font-family;
	}
	.date-picker{
		position:fixed;
		top: 10px;
		right: 20px;
		z-index: 2;
	}
</style>