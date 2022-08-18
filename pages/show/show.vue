<template>
	<uni-list>
		<uni-list-item v-for="item in detail"  :key="item[0]" :title="item[0]" :rightText="item[1]" />
	</uni-list>
	<view style="margin:30px;">
		<uni-button v-if="cancel" type="red" @click="cancelAppoint">取消预约</uni-button>
	</view>
</template>

<script>
	const db = uniCloud.database();
	import utils from '../../common/utils.js'
	export default {
		data() {
			return {
				detail: [],
				cancel:false,
				id:null
			};
		},
		methods:{
			// 取消预约
			cancelAppoint(){
				uni.showModal({
					title: '提示',
					content: '确定要取消预约吗？',
					success: res=> {
						if (res.confirm) {
							console.log('确定取消预约');
							uni.showLoading({mask:true})
							db.collection('srt-appoint').doc(this.id).remove().then(()=>{
								db.collection('srt-push').where(`aid=="${this.id}"`).remove().then(()=>{
									uni.showToast({
										icon: 'success',
										title: '预约取消成功',
										mask: true
									})
									setTimeout(uni.navigateBack,1500,{delta:1})
								})
							})
						}
					}
				});
			}
		},
		onLoad(e) {
			uni.setNavigationBarTitle({
				title: e.text
			})
			uni.showLoading({mask: true})
			this.id=e.id
			switch (e.type) {
				case 'profile':
					db.collection('uni-id-users').where(`_id=="${e.id}"`).field('nickname,mobile,school_id,statu').get().then(res=>{
						console.log(res)
						let data=res.result.data[0]
						this.detail=[
							['姓名', data.nickname],
							['电话号码', data.mobile],
							['学号/工号', data.school_id],
							['账号状态', data.statu?'封禁':'正常']
						]
						uni.hideLoading()
					}).catch(err => {
						console.log(err)
						uni.hideLoading()
						uni.showToast({
							icon: 'error',
							title: '服务器请求失败',
							complete: uni.navigateBack()
						})
					})
					break
				case 'appoint':
					const tmp1 = db.collection('srt-appoint').where(`_id=="${e.id}"`).getTemp()
					const tmp2 = db.collection('uni-id-users').field('_id,nickname,mobile,school_id').getTemp()
					const tmp3 = db.collection('srt-equip').getTemp()
					db.collection(tmp1,tmp2,tmp3).get().then(res => {
						console.log(res)
						let data = res.result.data[0]
						this.detail = [
							['课程/项目名称', data.title],
							['导师/任课教师', data.teacher],
							['预约人姓名', data.uid[0].nickname],
							['预约人电话', data.uid[0].mobile],
							['预约人学号/工号', data.uid[0].school_id],
							['预约日期',data.date],
							['预约时间', utils.numtoTime(data.start) + '~' + utils.numtoTime(data.end)],
							['预约设备',data.eid[0].name + ' ' + data.eid[0].order]
						]
						if(e.cancel) this.cancel=true
						uni.hideLoading()
					}).catch(err => {
						console.log(err)
						uni.hideLoading()
						uni.showToast({
							icon: 'error',
							title: '服务器请求错误',
							complete: uni.navigateBack()
						})
					})
					break
			}
		}
	}
</script>

<style lang="scss" scoped>
	.cancel{
		margin: 10px 20px;
	}
</style>
