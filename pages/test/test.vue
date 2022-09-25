<template>
	<view>
		<uni-section title="测试临时界面" subTitle="将在正式版中移除" type="line">
			<view v-if="login" class="col-flex" style="height:300px;justify-content:space-around;">
				<uni-button @click="changePower('USER')">切换为普通用户</uni-button>
				<uni-button @click="changePower('AUDITOR')">切换为管理员</uni-button>
				<uni-button @click="changePower('admin')">切换为超级管理员</uni-button>
			</view>
			<view v-else style="width:100%;text-align:center;padding:20px 0;">请先完成登录！</view>
		</uni-section>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex';
	const db = uniCloud.database()
	export default {
		data() {
			return {
				
			};
		},
		onLoad() {
			
		},
		computed:{
			...mapGetters({
				login: 'user/hasLogin'
			}),
		},
		methods:{
			...mapMutations({
				delUserInfo: 'user/logout'
			}),
			changePower(e){
				uni.showLoading({mask:true})
				console.log(uniCloud.getCurrentUserInfo().uid)
				db.collection('uni-id-users').doc(uniCloud.getCurrentUserInfo().uid).update({
					role:[e]
				}).then(ans=>{
					console.log(ans)
					this.delUserInfo()
					uni.hideLoading()
					uni.reLaunch({
						url:'/pages/index/index'
					})
				}).catch(err=>{
					console.log(err)
				})
			},
		}
	}
</script>

<style lang="scss">

</style>
