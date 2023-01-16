<template>
	<uni-card title="预约须知" subTitle="请仔细阅读以下条款" extra="李兆基科技大楼A305">
		<view v-for="(item,index) in mark" :key="index">{{item}}</view>
	</uni-card>
	<view style="padding:20px 8%;">
		<uni-forms label-width="100" ref="infoForm" :modelValue="appointData" :rules="rules">
			<uni-forms-item required label="预约日期" name="date">
				<uni-data-select v-model="appointData.date" placeholder="请选择预约日期" :localdata="dates" :clear="false" />
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
	const dates=[]
	const db = uniCloud.database();
	const tomorrow= day=>{return utils.formatTime(new Date(day.setDate(day.getDate() + 1)))}
	import utils from '../../common/utils.js'
	export default {
		data() {
			return {
				dates:[],
				st_time:[],
				ed_time:[],
				appointData:{
					date:null,
					title:null,
					teacher:null,
					start:null,
					end:null,
					state:0
				},
				rules: { // 校验设置
					date: {
						rules: [{
							required: true,
							errorMessage: '预约日期不能为空',
						}]
					},
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
				},
				mark:['1. 最早可以提前一周进行预约，部分日期可能因为设备检修等原因暂停开放。',
					'2. 一般3D打印用时较长，请合理估计预约时间，避免影响他人。',
					'3. 请按预约时间到场进行3D打印，多次违约可能受到一定惩罚措施。',
					]
			}
		},
		methods:{
			changeStart(e){
				this.rules.end.rules[1].minimum=e+1
			},
			submitForm(){
				uni.showLoading({mask:true})
				this.$refs.infoForm.validate(['state']).then(formData=>{
					formData.uid=uniCloud.getCurrentUserInfo().uid
					console.log(formData)
					return new Promise((resolve,reject)=>{
						uni.hideLoading()
						uni.requestSubscribeMessage({
							tmplIds: ['565SlmswFgNuEezLZ1Mnd4UbHgL4cgwhpfSxaUlKciw','2oavjREU4Kvy_hp3YYsRhkGpDgqkmleueBoFf9J358Q'],
						}).then(res=>{
							const now=new Date()
							// 提前预约45分钟以上才会收到提醒信息
							if(res['565SlmswFgNuEezLZ1Mnd4UbHgL4cgwhpfSxaUlKciw']=='accept' && (formData.date!=utils.formatTime(now) || formData.start-2*now.getHours()-now.getMinutes()/30>1.5)){formData.state+=1}
							// 接收预约取消通知
							if(res['2oavjREU4Kvy_hp3YYsRhkGpDgqkmleueBoFf9J358Q']=='accept'){formData.state+=2}
							// 提交预约信息
							uni.showLoading({mask:true})
							return db.collection('srt-appoint').add(formData)
						}).then(({result})=>{
							console.log(result)
							uni.hideLoading()
							uni.showToast({
								icon: 'success',
								title: '预约提交成功',
								mask: true
							})
							setTimeout(uni.navigateBack,1500,{delta:1})
						}).catch(err=>{
								reject(err)
						})
					})
				}).catch(err => {
					utils.errReport(err)
				})
			}
		},
		onLoad(e){
			uni.showLoading({mask:true})
			let times=[]
			for(let i=18;i<=44;i=i+2){
				times.push({text:utils.numtoTime(i),value:i})
			}
			this.st_time=times.slice(0,-1)
			this.ed_time=times.slice(1)
			
			// 时间常数
			const now = new Date()
			dates[0]=utils.formatTime(now)
			for(let i=1;i<7;i++){
				dates[i]=tomorrow(now)
			}
			
			// 数据库查询
			db.collection('srt-occupy').where(`(y_m=="${dates[0].substr(0,7)}" || y_m=="${dates[6].substr(0,7)}")`).field('day,y_m').orderBy('y_m asc').get().then(({result})=>{
				console.log(result)
				let k=0,data0=result.data
				// 数据处理
				for(let i in data0){
					while(data0[i].y_m>dates[k].substr(0,7)) 
						this.dates.push({text:dates[k],value:dates[k++]})
					while(k<7 && data0[i].y_m==dates[k].substr(0,7)){
						if(data0[i].day&1<<parseInt(dates[k].substr(8)))
							++k
						else
							this.dates.push({text:dates[k],value:dates[k++]})
					}
				}
				uni.hideLoading()
			}).catch(err=>{
				this.dates=[]
				utils.errReport(err)
			})
		}
	}
</script>

<style lang="scss" scoped>

</style>