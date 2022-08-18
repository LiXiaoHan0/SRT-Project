<template>
	<view v-if="role=='USER'">
		<uni-card v-for="(item,index) in userData" :key="item._id" :title="item.title" :extra="'点击查看详情'" @click="goAppoint(item._id)">
			<text>预约日期：{{item.date}}\n预约时间：{{userTime[index]}}\n预约地点：清华大学李兆基科技大楼A305</text>
		</uni-card>
	</view>
	<view v-else-if="role=='AUDIT'">
		权限为管理员
	</view>
	<view v-else-if="role=='admin'">
		权限为超级管理员
	</view>
	<view v-else>
		请先完成登录！
	</view>
</template>

<script>
	const db = uniCloud.database()
	import utils from '../../common/utils.js'
	export default {
		data() {
			return {
				role:null,
				userData:[]
			};
		},
		onShow() {
			this.role=uniCloud.getCurrentUserInfo().role[0]
			this.refresh()
		},
		onPullDownRefresh() {
			this.refresh()
		},
		computed:{
			userTime(){
				let data=[]
				for(let i in this.userData)
					data.push(utils.numtoTime(this.userData[i].start)+'~'+utils.numtoTime(this.userData[i].end))
				return data
			}
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
						break
				}
			},
			// 刷新用户数据
			refreshUserData(){
				uni.showLoading({mask:true})
				db.collection('srt-appoint').where(`date>="${new Date().toISOString().slice(0, 10)}" && uid=="${uniCloud.getCurrentUserInfo().uid}"`).field('title,start,end,date').get().then(({result})=>{
					console.log(result)
					this.userData=result.data
					uni.hideLoading()
				}).catch(err => {
					console.log(err)
					uni.hideLoading()
					uni.showToast({
						icon: 'error',
						title: '服务器请求错误'
					})
				})
			},
			// 刷新管理员数据
			refreshAuditData(){
				
			},
			// 刷新超级管理员数据
			refreshAdminData(){
				
			},
			// 跳转至预约详细信息
			goAppoint(id){
				uni.navigateTo({
					url:`../show/show?type=appoint&text=预约详细信息&id=${id}&cancel=1`
				})
			}
		}
	}
</script>

<style lang="scss">

</style>
