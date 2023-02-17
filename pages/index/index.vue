<template>
	<!-- 用户信息 -->
	<view class="row-flex userinfo">
		<cloud-image class="avatar" v-if="userInfo.avatar" :src="userInfo.avatar"></cloud-image>
		<image v-else class="avatar" src="@/static/grey.jpg"></image>
		<view class="col-flex" style="align-items: flex-start;">
			<view class="row-flex">
				<uni-tag class="identity" :text="identity[0]" :type="identity[1]" />
				<uni-icons v-if="login" type="refreshempty" size="20" color="#FFFFFF" @click="goIdentity"></uni-icons>
			</view>
			<view class="nickname">{{userInfo.nickname}}</view>
		</view>
		<uni-button bgcolor="#FFFFFF00" bordcolor="#FFFFFF" hovercolor="#FFFFFF66" style="margin-top:20px;" @click="goLogin">
			<text>{{buttonText}}</text>
		</uni-button>
	</view>
	<!-- 设备信息 -->
	<view class="row-flex" style="flex-wrap:wrap;padding: 5px;">
		<uni-card v-for="equip in equips" :key="equip._id._value" 
		 class="equip" :title="equip.name" :sub-title="'编号：'+equip.order" 
		 margin="8px" @click="goAppoint(equip)">
			<text>状态： </text>
			<uni-tag :circle="true" :text="tags[equip.state][0]" :type="tags[equip.state][1]"/>
		</uni-card>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapGetters
	} from 'vuex';
	import utils from '../../common/utils';
	export default {
		data() {
			return {
				equips:[],
				tags:[['空闲','success'],['停用','default'],['占用','error']]
			}
		},
		computed: {
			...mapGetters({
				userInfo: 'user/info',
				login: 'user/hasLogin'
			}),
			identity(){
				switch(this.userInfo.role[0]){
					case 'VISITOR':
						return ['游客','default']
					case 'USER':
						return ['普通用户','primary']
					case 'AUDITOR':
						return ['管理员','warning']
					case 'admin':
						return ['超级管理员','error']
					default:
						return ['未授权','default']
				}
			},
			buttonText(){
				if(!this.login)
					return "微信\n登陆"
				else if(!this.userInfo.mobile)
					return "完善\n信息"
				else
					return "修改\n信息"
			}
		},
		// 初始化加载
		onLoad() {
			this.refreshEquip()
		},
		// 下拉刷新
		onPullDownRefresh(){
			this.refreshEquip()
		},
		onShareAppMessage() { // 分享
			return {
				title:'机械系实验中心',
				path: 'pages/index/index',
				imageUrl: '/static/topic.jpg' // 分享封面图片
			}
		},
		onShareTimeline() { // 转发朋友圈
			return {
				title:'机械系实验中心',
				query: 'pages/index/index',
				imageUrl: '/static/topic.jpg'
			}
		},
		methods: {
			...mapMutations({
				setUserInfo: 'user/login',
				delUserInfo: 'user/logout'
			}),
			// 更新设备信息
			refreshEquip(msg){
				let t=uniCloud.getCurrentUserInfo().tokenExpired
				if(t<=Date.now()){
					if(t>0){
						this.delUserInfo()
						uni.showToast({
							icon: 'none',
							title: '登录过期,请重新登录'
						})
					}
				} else{
					uni.showLoading({mask:true})
					// 当前时间常数
					const now=new Date()
					const date=utils.formatTime(now)
					const hour=(now.getHours()+parseInt(now.getMinutes()/60))<<1
					// 数据库查询
					const db = uniCloud.database();
					const tmp1=db.collection('srt-appoint').where(`date=="${date}" && start<=${hour} && end>${hour}`).field('eid,end').getTemp()
					const tmp2=db.collection('srt-occupy').where(`y_m=="${date.substr(0,7)}"`).field('eid,day').getTemp()
					db.collection('srt-equip',tmp1,tmp2).orderBy('order asc').get().then(({result})=>{
						console.log(result)
						for(let i in result.data){
							let t=result.data[i]
							if(t._id['srt-appoint'].length){
								// t.state=(t._id['srt-appoint'][0].end-hour)/2
								t.state=2 // 使用状态
							} else if(t._id['srt-occupy'].length && t._id['srt-occupy'][0].day&1<<now.getDate()){
								t.state=1 // 禁用状态
							} else{
								t.state=0 // 空闲状态
							}
						}
						this.equips=result.data
						uni.hideLoading()
					}).catch(err=>{
						console.log(err)
						uni.hideLoading()
						uni.showToast({
							icon: 'error',
							title: err.code=='TOKEN_INVALID_ANONYMOUS_USER'?'请先完成登录':'服务器请求失败'
						})
					})
				}
			},
			// 更新用户信息
			refreshUser(text){
				return new Promise((resolve,reject)=>{
					uni.showLoading({mask: true})
					uni.login({
						"provider": "weixin",
						"onlyAuthorize": true
					}).then(res => { // 获取uniID
						console.log(res)
						return uniCloud.callFunction({
							name: 'uni-id-cf',
							data: {
								action: 'loginByWeixin',
								params: res.code
							}
						})
					}).then(({result}) => {
						//保存用户信息
						result.userInfo.uid = result.uid
						delete result.userInfo.token
						this.setUserInfo(result.userInfo)
						if ('mobile' in result.userInfo) {
							uni.hideLoading()
							uni.showToast({
								title: text,
								icon: 'success'
							});
							console.log(text);resolve({bind:true});
						}else{
							uni.hideLoading()
							resolve({bind:false,uid:result.uid})
						}
					}).catch(err=>{
						reject(err)
					})
				})
			},
			// 点击登录按钮
			goLogin() {
				if(this.login){
					uni.navigateTo({
						url: '../login/login?uid=' + this.userInfo.uid + '&change='+(this.userInfo.mobile?'true':'false')
					})
				} else {
					this.refreshUser('登录成功').then(res=>{
						if(!res.bind){
							uni.navigateTo({
								url: '../login/login?uid=' + res.uid + '&change=false'
							})
						}
						this.refreshEquip()
					}).catch(err => {
						utils.errReport(err)
					})
				}
			},
			// 点击身份刷新
			goIdentity(){
				this.refreshUser('更新成功').catch(err =>{
					utils.errReport(err)
				})
			},
			// 点击预约设备
			goAppoint(equip){
				if('mobile' in this.userInfo){
					uni.navigateTo({
						url:`../equip/equip?eid=${equip._id._value}&name=${equip.name}&order=${equip.order}`
					})					
				} else {
					uni.showToast({
						icon: 'none',
						title: "请先完善信息！"
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	// 顶部个人信息栏
	.userinfo {
		width: 100%;
		height: 150px;
		padding: var(--status-bar-height) 0 0 0;
		background-image: linear-gradient(120deg, $tsinghua1 60%, $tsinghua2 100%);
	}

	.avatar {
		position: relative;
		z-index: 1;
		width: 80px;
		height: 80px;
		overflow: hidden;
		border-radius: 50%;
		border: #ab6db4 solid 3px;
	}

	.identity {
		height: 25px;
		margin: 15px 15px;
	}

	.nickname {
		position: relative;
		left: -40px;
		width: 120px;
		margin-right: -20px;
		padding: 3px 15px 3px 40px;
		font: bold large $body-font-family;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		background-color: #fff;
		border-radius: 0 15px 15px 0;
	}
	
	// 设备信息栏
	.equip{
		width: 50%;
		min-width: 175px;
		max-width: 250px;
	}
</style>