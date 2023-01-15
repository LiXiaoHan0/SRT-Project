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
		<uni-button :style="this.userInfo.mobile?'visibility:hidden':''" bgcolor="#FFFFFF00" bordcolor="#FFFFFF" hovercolor="#FFFFFF66" style="margin-top:20px;" @click="goLogin">
			<text>{{buttonText}}</text>
		</uni-button>
	</view>
	<!-- 功能按钮 -->
	<view class="row-flex button_box">
		<uni-button style="margin-top:20px" bgcolor="#53038A" hovercolor="#660874" @click="goAppoint">
			<view class="col-flex">
				<image class="button_image" src="../../static/index/2.png"></image>
				<text style="font-size:16px;">预约打印设备</text>
			</view>
		</uni-button>
		<uni-button style="margin-top:20px" bgcolor="#53038A" hovercolor="#660874" @click="changeInfo">
			<view class="col-flex">
				<image class="button_image" src="../../static/index/1.png"></image>
				<text style="font-size:16px;">修改个人信息</text>
			</view>
		</uni-button>
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
			return {}
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
						url: '../login/login?uid=' + this.userInfo.uid + '&change=false'
					})
				} else {
					this.refreshUser('登录成功').then(res=>{
						if(!res.bind){
							uni.navigateTo({
								url: '../login/login?uid=' + res.uid + '&change=false'
							})
						}
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
			// 修改个人信息
			changeInfo(){
				uni.navigateTo({
					url: '../login/login?uid=' + this.userInfo.uid + '&change=true'
				})
			},
			// 前往设备预约
			goAppoint(){
				uni.navigateTo({
					url: '../appoint/appoint?uid=' + this.userInfo.uid + '&change=true'
				})
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
	
	.button_box{
		height: 160px;
		margin: 0 12px;
		justify-content:space-around;
	}
	
	.button_image{
		height: 70px;
		width: 70px;
		margin-bottom: 8px;
	}
</style>