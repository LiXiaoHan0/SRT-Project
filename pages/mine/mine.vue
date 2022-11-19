<template>
	<!-- 权限为普通用户 -->
	<view v-if="role=='USER'">
		<uni-card v-for="item in userData" :key="item._id" :title="item.title" :extra="'点击查看详情'" @click="goAppoint(item._id)">
			<text>预约日期：{{item.date}}\n预约时间：{{realTime(item)}}\n预约地点：清华大学李兆基科技大楼A305</text>
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
	<view v-else-if="role=='admin'">
		<uni-collapse accordion>
			<uni-collapse-item v-for="(title,i) in ['超级管理员列表','管理员列表']" :key="i" :title="title">
				<uni-list>
					<uni-list-item v-for="item in adminData[i].data" :key="item._id" 
					:title="item.nickname" :note="'最后登陆时间：'+changeTime(item.last_login_date)" 
					:thumb="item.avatar" thumb-size="lg" rightText="详细信息" 
					showArrow clickable @click="goProfile(item._id,i)" />
				</uni-list>
			</uni-collapse-item>
		</uni-collapse>
		<view class="nominee">
			<uni-button @click="goSearch">
				<uni-icons type="plus" size="18" color="#fff"/>
				<text> 设置新的管理员</text>
			</uni-button>			
		</view>
	</view>
	<uni-fab v-if="role=='AUDITOR' || role=='admin'" :pattern="pattern" :content="content" @trigger="trigger" />
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
				pattern:{
					color:'#660874',
					buttonColor:'#660874'
				},
				content:[{
					iconPath:'/static/fab/equip.png',
					text:'设备',
					url:'../operate/operate'
				},{
					iconPath:'/static/fab/chart.png',
					text:'统计',
					url:'../statistic/statistic'
				}],
				// 用户数据
				userData:[],
				// 管理员数据
				auditData:[],
				title:'今日',
				message:[],
				today:utils.formatTime(new Date()),
				dateInfo:{start:'',end:''},
				// 超级管理员数据
				adminData:[{data:[]},{data:[]}]
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
			}
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
						this.refreshAdminData()
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
				db.collection('srt-appoint').where(`date>="${utils.formatTime(new Date())}" && uid=="${uniCloud.getCurrentUserInfo().uid}"`).field('title,start,end,date').get().then(({result})=>{
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
			refreshAdminData(){
				uni.showLoading({mask:true})
				const getAudit = db.collection('uni-id-users').where('role[0]=="admin"').field('nickname,avatar,last_login_date').getTemp()
				const getAdmin = db.collection('uni-id-users').where('role[0]=="AUDITOR"').field('nickname,avatar,last_login_date').getTemp()
				db.multiSend(getAudit,getAdmin).then(({result})=>{
					console.log(result)
					this.adminData=result.dataList
					uni.hideLoading()
				}).catch(err => {
					utils.errReport(err)
				})
			},
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
			trigger(e) {
				uni.navigateTo({
					url:this.content[e.index].url
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.nominee{
		color: #fff;
		margin: 30px 60px;
	}
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