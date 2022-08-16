<template>
	<view style="padding:20px 8%;">
		<uni-forms label-width="100" ref="infoForm" :modelValue="appointData" :rules="rules">
			<uni-forms-item required label="预约日期">
				<uni-easyinput disabled type="text" v-model="appointData.date" />
			</uni-forms-item>
			<uni-forms-item required label="预约开始时间" name="start">
				<uni-data-select v-model="appointData.start" placeholder="请选择预约开始时间" :localdata="st_time" :clear="false" @change="changeStart" />
			</uni-forms-item>
			<uni-forms-item required label="预约结束时间" name="end">
				<uni-data-select v-model="appointData.end" placeholder="请选择预约结束时间" :localdata="ed_time" :clear="false" />
			</uni-forms-item>
			<uni-forms-item required label="课程/项目名称" name="title">
				<uni-easyinput type="text" v-model="appointData.title" placeholder="请输入项目/课程名称" />
			</uni-forms-item>
			<uni-forms-item required label="导师/任课教师" name="teacher">
				<uni-easyinput type="text" v-model="appointData.teacher" placeholder="请输入导师/教师名字" />
			</uni-forms-item>
		</uni-forms>
		<view style="margin:30px;">
			<uni-button @click="submitForm">提交信息</uni-button>
		</view>
	</view>
</template>

<script>
	import utils from '../../common/utils.js'
	export default {
		data() {
			return {
				st_time:[],
				ed_time:[],
				appointData:{
					eid:null,
					date:null,
					title:null,
					teacher:null,
					start:null,
					end:null
				},
				rules: { // 校验设置
					title: {
						rules: [{
							required: true,
							errorMessage: '项目/课程名称不能为空',
						}]
					},
					teacher: {
						rules: [{
							required: true,
							errorMessage: '导师/任课教师名字不能为空',
						},{
							minLength: 2,
							maxLength: 5,
							errorMessage: '名字长度应在 {minLength} 到 {maxLength} 个字符',
						}]
					},
					start:{
						rules: [{
							required: true,
							errorMessage: '预约开始时间不能为空',
						}]
					},
					end:{
						rules: [{
							required: true,
							errorMessage: '预约结束时间不能为空',
						},{
							minimum:18,
							errorMessage: '结束时间不能小于等于开始时间',
						}]
					}
				}
			}
		},
		methods:{
			changeStart(e){
				this.rules.end.rules[1].minimum=e+1
			},
			submitForm(){
				uni.showLoading({mask:true})
				this.$refs.infoForm.validate(['date','eid']).then(formData=>{
					formData.uid=uniCloud.getCurrentUserInfo().uid
					console.log(formData)
					const db = uniCloud.database();
					return new Promise((resolve,reject)=>{
						db.collection('srt-appoint').add(formData).then(({result})=>{
							console.log(result)
							uni.hideLoading()
							uni.requestSubscribeMessage({
								tmplIds: ['565SlmswFgNuEezLZ1Mnd4UbHgL4cgwhpfSxaUlKciw'],
								success(res){
									console.log(res)
									if(res['565SlmswFgNuEezLZ1Mnd4UbHgL4cgwhpfSxaUlKciw']=='accept'){
										const t=new Date()
										// 提前预约45分钟以上才会收到提醒信息
										if(formData.date!=t.toISOString().slice(0, 10) || formData.start-2*t.getHours()-t.getMinutes()/30>1.5){
											db.collection('srt-push').add({
												uid:uniCloud.getCurrentUserInfo().uid,
												aid:result.id,
												date:formData.date,
												time:formData.start-2
											})
										}
									}
								},
								complete(){
									uni.navigateBack({
										delta:2,
										complete:uni.showToast({
											icon: 'success',
											title: '预约提交成功',
										})
									})
								}
							})
						}).catch(err=>{
							reject(err)
						})
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
		onLoad(e){
			let times=[],detail=[]
			detail=e.detail.split('/')
			console.log(e.eid)
			this.appointData.eid=e.eid
			this.appointData.date=detail[0]
			for(let i=parseInt(detail[1]);i<=parseInt(detail[2]);i=i+2){
				times.push({text:utils.numtoTime(i),value:i})
			}
			this.st_time=times.slice(0,-1)
			this.ed_time=times.slice(1)
		}
	}
</script>

<style lang="scss" scoped>

</style>