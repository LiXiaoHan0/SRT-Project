<template>
	<view style="width: 100%;">
		<view class="row-flex userinfo">
			<cloud-image class="avatar" v-if="userInfo.avatar" :src="userInfo.avatar"></cloud-image>
			<image v-else class="avatar" src="@/static/grey.jpg"></image>
			<view class="col-flex" style="align-items: flex-start;">
				<uni-tag class="identity" :text="identity[0]" :type="identity[1]"></uni-tag>
				<view class="nickname">{{userInfo.nickname}}</view>
			</view>
			<uni-button bgcolor="#FFFFFF00" bordcolor="#FFFFFF" hovercolor="#FFFFFF66" style="margin-top:20px;" @click="gotologin">
				<text>{{buttonText}}</text>
			</uni-button>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
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
				else if(!this.userInfo.nickname)
					return "完善\n信息"
				else
					return "修改\n信息"
			}
		},
		onLoad() {},
		methods: {
			...mapMutations({
				setUserInfo: 'user/login'
			}),
			gotologin() {
				if(this.login){
					uni.navigateTo({
						url: '../login/login?uid=' + this.userInfo.uid + '&change='+(this.userInfo.nickname?"true":"false")
					})
				} else {
					uni.showLoading({
						mask: true
					}).then(() => {
						return uni.login({
							"provider": "weixin",
							"onlyAuthorize": true
						})
					}).then(res => { // 获取uniID
						console.log(res)
						return uniCloud.callFunction({
							name: 'uni-id-cf',
							data: {
								action: 'loginByWeixin',
								params: res.code
							}
						})
					}).then(({
						result
					}) => {
						console.log(result)
						if ('nickname' in result.userInfo) {
							this.setUserInfo(result.userInfo)
							uni.hideLoading()
							uni.showToast({
								title: '登录成功',
								icon: 'success'
							});
							console.log('登录成功', result);
						} else {
							uni.navigateTo({
								url: '../login/login?uid=' + result.uid + '&change=false'
							}).then(uni.hideLoading())
						}
					}).catch(err => {
						console.log(err)
						uni.hideLoading().then(uni.showToast({
							icon: 'error',
							title: "服务器请求错误"|| err.msg
						}))
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
		height: 30px;
		margin: 10px 15px;
	}

	.nickname {
		position: relative;
		left: -40px;
		min-width: 80px;
		max-width: 120px;
		padding: 3px 15px 5px 40px;
		font: bold large $body-font-family;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		background-color: #ffffff;
		border-radius: 0 15px 15px 0;
	}
</style>