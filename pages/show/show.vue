<template>
	<uni-list>
		<uni-list-item v-for="item in detail"  :key="item[0]" :title="item[0]" :rightText="item[1]" />
	</uni-list>
	<view class="item">
		<uni-button v-if="item&&detail[0]" :type="pattern" @click="changeItem(item)">{{item}}</uni-button>
	</view>
</template>

<script>
	const db = uniCloud.database();
	import utils from '../../common/utils.js'
	export default {
		data() {
			return {
				id:null,
				item: null, // 事项名称
				pattern:null, // 按钮类型
				detail: []
			};
		},
		methods:{
			// 处理具体事项
			changeItem(e){
				uni.showModal({
					title: '提示',
					content: '确定要'+e+'吗？',
				}).then(res=>{
					if (res.confirm) {
						console.log('确定'+e);
						uni.showLoading({mask:true})
						switch (e){
							case '取消预约':
								return uniCloud.callFunction({
									name: 'cancel-msg',
									data: {
										item:[this.id],
										log:'用户自主取消预约'
									}
								})
							case '解除权限':
								return db.collection('uni-id-users').doc(this.id).update({
									role:['USER']
								})
							case '设置管理员':
								return db.collection('uni-id-users').doc(this.id).update({
									role:['AUDITOR']
								})
						}
					} else{
						throw new Error('用户点击取消')
					}
				}).then(res=>{
					console.log(res)
					uni.hideLoading()
					uni.showToast({
						icon: 'success',
						title: e+'成功',
						mask: true
					})
					setTimeout(uni.navigateBack,1500,{delta:1})
				})
			}
		},
		onLoad(e) {
			uni.setNavigationBarTitle({
				title: e.text
			})
			uni.showLoading({mask: true})
			this.id=e.id
			if(e.item){
				this.item=e.item
				switch(e.item){
					case '取消预约':
					case '解除权限':
						this.pattern='red';break
					case '设置管理员':
						this.pattern='green';break
				}
			}
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
							['指导教师姓名', data.teacher],
							['预约用户姓名', data.uid[0].nickname],
							['预约用户电话', data.uid[0].mobile],
							['预约用户学/工号', data.uid[0].school_id || '校外用户'],
							['预约日期',data.date],
							['预约时间', utils.numtoTime(data.start) + '~' + utils.numtoTime(data.end)],
							['预约设备',data.eid[0].name + ' ' + data.eid[0].order]
						]
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
	.item{
		margin: 30px 60px;
	}
</style>