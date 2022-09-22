<template>
	<!-- 权限为普通用户 -->
	<view v-if="role=='USER'">
		<uni-card v-for="(item,index) in userData" :key="item._id" :title="item.title" :extra="'点击查看详情'" @click="goAppoint(item._id)">
			<text>预约日期：{{item.date}}\n预约时间：{{userTime[index]}}\n预约地点：清华大学李兆基科技大楼A305</text>
		</uni-card>
	</view>
	<!-- 权限为管理员 -->
	<view v-else-if="role=='AUDITOR'">
		权限为管理员，还没有开发
	</view>
	<!-- 权限为超级管理员 -->
	<view v-else-if="role=='admin'">
		<uni-collapse accordion>
			<uni-collapse-item v-for="(title,i) in ['超级管理员列表','管理员列表']" :key="i" :title="title">
				<uni-list>
					<uni-list-item v-for="item in adminData[i].data" :key="item._id" 
					:title="item.nickname" :note="'最后登陆时间：'+changeTime(item.last_login_date)" 
					:thumb="item.avatar" thumb-size="lg" rightText="详细信息" 
					showArrow clickable @click="goProfile(item._id)" />
				</uni-list>
			</uni-collapse-item>
		</uni-collapse>
	</view>
</template>

<script>
	const db = uniCloud.database()
	import utils from '../../common/utils.js'
	export default {
		data() {
			return {
				role:'none',
				userData:[],
				auditData:[],
				adminData:[{data:[]},{data:[]}]
			};
		},
		onShow() {
			let tmp=uniCloud.getCurrentUserInfo().role[0]
			if(tmp) this.role=tmp
			this.refresh()
		},
		onPullDownRefresh() {
			this.refresh()
		},
		onTabItemTap(){
			if(this.role=='none'){
				uni.showToast({
					icon:'error',
					title:'请先完成登录'
				})
			}
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
				db.collection('uni-id-users').where(`date>="${new Date().toISOString().slice(0, 10)}" && uid=="${uniCloud.getCurrentUserInfo().uid}"`).field('title,start,end,date').get().then(({result})=>{
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
				uni.showLoading({mask:true})
				const getAudit = db.collection('uni-id-users').where('in("admin",role)').field('nickname,avatar,last_login_date').getTemp()
				const getAdmin = db.collection('uni-id-users').where('in("AUDITOR",role)').field('nickname,avatar,last_login_date').getTemp()
				db.multiSend(getAudit,getAdmin).then(({result})=>{
					console.log(result)
					this.adminData=result.dataList
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
			// 跳转至预约详细信息
			goAppoint(id){
				uni.navigateTo({
					url:`../show/show?type=appoint&text=预约详细信息&id=${id}&cancel=1`
				})
			},
			// 跳转至个人详细信息
			goProfile(id){
				uni.navigateTo({
					url:`../show/show?type=profile&text=个人详细信息&id=${id}`
				})
			},
			// 时间处理函数
			changeTime(t){
				return utils.changeTime(t)
			}
		}
	}
</script>

<style lang="scss">

</style>