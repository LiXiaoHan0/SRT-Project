<template>
	<view class="col-flex">
		<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
			<image style="width: 80px;height: 80px;" :src="loginData.avatar"></image>
		</button>
		<uni-forms label-width="100" ref="infoForm" :modelValue="loginData" :rules="rules">
			<uni-forms-item required label="姓名" name="nickname">
				<uni-easyinput type="text" v-model="loginData.nickname" placeholder="请输入姓名" />
			</uni-forms-item>
			<uni-forms-item required label="电话" name="mobile">
				<uni-easyinput type="number" v-model="loginData.mobile" placeholder="请输入电话号码" />
			</uni-forms-item>
			<uni-forms-item required label="身份" name="in_campu">
				<uni-data-checkbox selectedColor="#660874" v-model="loginData.in_campu" :localdata="identity">
				</uni-data-checkbox>
			</uni-forms-item>
			<uni-forms-item required label="学号/工号" name="school_id" v-if="loginData.in_campu">
				<uni-easyinput type="number" v-model="loginData.school_id" placeholder="请输入学号/工号" />
			</uni-forms-item>
		</uni-forms>
		<view class="row-flex" style="margin:30px;justify-content:space-around;width:100%;">
			<uni-button @click="submitForm">提交信息</uni-button>
			<uni-button v-if="change" @click="exitAccount">退出登录</uni-button>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	let userId = null
	const defaultUrl = '../../static/grey.jpg'
	const CloudUrl = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-340aeb7f-4bf8-464b-ba11-8d1b8bc075d5/5a416824-56c7-4529-9a10-4bb280313dcc.jpg'
	export default {
		data() {
			return {
				change:false,
				loginData: {
					nickname: '', // 姓名
					avatar: defaultUrl, // 头像地址
					mobile: '', // 电话号码
					in_campu: null, // 是否校内人员
					school_id: '', // 学号、工号
					role: ['USER'], // 身份默认普通用户
					statu: 0 // 账号状态
				},
				identity: [{
					"value": 1,
					"text": "校内师生"
				}, {
					"value": 0,
					"text": "校外人员"
				}],
				rules: { // 校验设置
					nickname: {
						rules: [{
							required: true,
							errorMessage: '姓名不能为空',
						}, {
							minLength: 2,
							maxLength: 5,
							errorMessage: '姓名长度应在 {minLength} 到 {maxLength} 个字符',
						}],
					},
					mobile: {
						rules: [{
							required: true,
							errorMessage: '电话号码不能为空',
						}, {
							minLength: 11,
							maxLength: 11,
							errorMessage: '电话号码长度应为11位',
						}],
					},
					in_campu: {
						rules: [{
							required: true,
							errorMessage: '请选择身份',
						}]
					},
					school_id: {
						rules: [{
							required: true,
							errorMessage: '学号/工号不能为空',
						}, {
							minLength: 10,
							maxLength: 10,
							errorMessage: '学号/工号长度应为10位',
						}],
					},
				}
			}
		},
		computed: {
			...mapGetters({
				userInfo: 'user/info'
			}),
		},
		methods: {
			...mapMutations({
				setUserInfo: 'user/login',
				delUserInfo: 'user/logout'
			}),
			// 选择头像
			onChooseAvatar({detail}) {
				if (detail.avatarUrl) {
					console.log('选择头像',detail.avatarUrl)
					this.loginData.avatar = detail.avatarUrl
				}
			},
			// 信息校验
			submitForm(e) {
				this.$refs.infoForm.validate(['avatar','role','statu']).then(formData => {
					delete formData.in_campu
					if (formData.avatar === defaultUrl) {
						uni.showModal({
							title: "提示",
							content: "确认要使用默认头像吗？"
						}).then(res => {
							if (res.confirm) {
								this.uploadInfo(formData)
							}
						})
					} else {
						this.uploadInfo(formData)
					}
				}).catch(err => {
					console.log('校验错误', err)
				})
			},
			// 退出登录
			exitAccount(){
				this.delUserInfo()
				uni.reLaunch({
					url:'/pages/index/index'
				})
			},
			// 信息绑定
			uploadInfo(detail) {
				uni.showLoading({mask: true})
				let cloudPath = userId + '/' + Date.now() + 'avatarUrl.jpg';
				new Promise((resolve, reject) => {
					if (this.loginData.avatar === defaultUrl) {
						resolve({
							fileID: CloudUrl
						})
					} else if(this.loginData.avatar === this.userInfo.avatar){
						resolve({
							fileID: this.loginData.avatar
						})
					}else{
						console.log(this.loginData.avatar);
						uniCloud.uploadFile({
							filePath: this.loginData.avatar,
							cloudPath,
							fileType: 'image',
							success: res => {
								resolve(res)
							},
							fail: err => {
								reject(err)
							}
						})
					}
				}).then(result => {
					let data = Object.assign({}, detail, {
						avatar: result.fileID,
						school_id:detail.school_id || ''
					})
					console.log("上传成功", data);
					// 使用 clientDB 提交数据
					const db = uniCloud.database();
					return new Promise((resolve,reject)=>{
						db.collection('uni-id-users').where('_id==\"'+userId+'\"').update(data).then(res => {
							console.log(res);
							delete data.token
							this.setUserInfo(data);
							resolve()
						}).catch(err=>{
							reject(err)
						})
					})
				}).then(()=>{
					uni.hideLoading()
					uni.showToast({
						title:'信息提交成功',
						icon: 'success',
						complete: uni.navigateBack()
					})
				}).catch(err => {
					console.log(err)
					uni.hideLoading()
					uni.showToast({
						icon: 'error',
						title: '服务器请求失败'
					})
				})
			}
		},
		onLoad(e) {
			console.log(e.uid)
			userId=e.uid
			if(e.change=='true'){
				uni.setNavigationBarTitle({
					title:'修改信息'
				})
				let data=this.userInfo
				this.change=true
				this.loginData={
					nickname: data.nickname,
					avatar: data.avatar,
					mobile: data.mobile,
					in_campu: data.school_id?1:0,
					school_id: data.school_id,
					role: data.role,
					statu: data.statu
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.avatar-wrapper {
		padding: 0;
		width: 86px;
		height: 86px;
		margin: 20px 0;
		border-radius: 50%;
		border: $tsinghua3 solid 3px;
	}
</style>
