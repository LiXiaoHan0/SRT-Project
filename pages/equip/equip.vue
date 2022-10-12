<template>
	<uni-card :title="equip.name" :subTitle="'设备编号：'+equip.order" :extra="'清华大学李兆基科技大楼A305'">
		<view v-for="(item,index) in mark" :key="index">{{item}}</view>
	</uni-card>
	<view v-show="periods.length" class="row-flex" style="padding:3%;margin-top:-20px;">
		<view style="width:9%;">
			<view style="height:60px;"></view>
			<view class="col-flex" v-for="t in 13" :key="t">
				<view class="divline"></view>
				<view class="time">{{(t==1?'0':'')+(t+8)}}</view> 
				<!-- <view v-if="t==13" class="divline"></view> -->
			</view>
		</view>
		<view v-for="(day,i) in periods" :key="i" style="width:13%;margin:3px 0;">
			<view class="col-flex">
				<view class="title">{{calWeek(i)}}</view>
				<view :class="!i?'circle':'title'">{{calDay(i)}}</view>
			</view>
			<view v-for="period in day" :key="period._id" class="brick" :style="calHeight(period)" @click="gotoAppoint(period._id)"></view>
		</view>
	</view>
</template>

<script>
	import utils from '../../common/utils'
	const dates=[]
	const tomorrow= day=>{return utils.formatTime(new Date(day.setDate(day.getDate() + 1)))}
	export default {
		data() {
			return {
				equip:{},
				periods:[],
				mark:['1. 请点击下方绿色时间段进行设备预约。','2. 一般3D打印用时较长，请合理估计预约时间，避免影响他人。','3. 请按预约时间进行3D打印，多次违约可能受到一定惩罚措施。']
			}
		},
		computed:{
			userInfo(){
				return this.$store.state.user.info
			} 
		},
		methods: {
			// 参数处理
			calHeight(period){
				return {
					'--height':20*period._value-4+'px',
					'--color':period._id.length==24?'#EB3341':'#00BF00'
				}
			},
			calDay(i){
				return dates[i].slice(-2)
			},
			calWeek(i){
				let t=['日','一','二','三','四','五','六']
				return t[new Date(dates[i]).getDay()]
			},
			// 预约信息更新
			refreshState(){
				uni.showLoading({mask:true})
				// 时间常数
				const now = new Date()
				dates[0]=utils.formatTime(now)
				for(let i=1;i<7;i++){
					dates[i]=tomorrow(now)
				}
				// 数据库查询
				const db = uniCloud.database();
				db.collection('srt-appoint').where(`eid=="${this.equip.eid}" && date>="${dates[0]}" && date<="${dates[6]}"`).field('start,end,date').orderBy('date asc,start asc').get().then(({result})=>{
					console.log(result)
					let j=0,begin=18
					let {data}=result
					let period=[[],[],[],[],[],[],[]]
					// 数据处理
					data.push({date:tomorrow(now),_id:''})
					for(let i in data){
						while(data[i].date>dates[j]){
							if(44-begin){
								period[j].push({
									_value:44-begin,
									_id:dates[j]+`/${begin}/44`
								})
							}
							j=j+1;begin=18
						}
						if(j===7){break}
						if(data[i].start==begin){
							period[j].push({
								_value:data[i].end-data[i].start,
								_id:data[i]._id
							})
							begin=data[i].end
						} else{
							period[j].push({
								_value:data[i].start-begin,
								_id:dates[j]+`/${begin}/${data[i].start}`,
							})
							period[j].push({
								_value:data[i].end-data[i].start,
								_id:data[i]._id
							})
							begin=data[i].end
						}
					}
					console.log(period)
					this.periods=period
					uni.hideLoading()
				}).catch(err=>{
					this.periods=[]
					utils.errReport(err)
				})
			},
			// 前往预约界面
			gotoAppoint(id){
				if(this.userInfo.statu){
					uni.showToast({
						title:'账号因违规封禁中，请联系管理员！',
						icon: 'none'
					})
				}else if(this.userInfo.role.includes('USER')){
					if(id.length==24){
						uni.showToast({
							title:'该时间段已被预约',
							icon: 'none'
						})
					}else {
						uni.navigateTo({
							url:`../appoint/appoint?eid=${this.equip.eid}&detail=${id}`
						})
					}
				}else{
					if(id.length==24){
						uni.navigateTo({
							url:`../show/show?type=appoint&text=预约详细信息&id=${id}`
						})
					}else {
						uni.showToast({
							title:'管理员无法进行预约',
							icon: 'none'
						})
					}
				}
			}
		},
		onLoad(e) {
			this.equip={			
				eid: e.eid,
				name:e.name,
				order:e.order
			} 
		},
		onShow() {
			this.refreshState()
		},
		onPullDownRefresh(){
			this.refreshState()
		}
	}
</script>

<style lang="scss" scoped>
	.title{
		text-align: center;
		font: normal 16px/30px $body-font-family;
	}
	.circle{
		@extend .title;
		width: 30px;
		height: 30px;
		color: #fff;
		border-radius: 50%;
		background-color: $grey2;
	}
	.divline {
		width: 80%;
		height: 2px;
		margin: 1px 0;
		border-radius: 1px;
		background-color: $grey2;
	}
	.time{
		height: 36px;
		margin: 0px 5%;
		font: normal 16px/16px $body-font-family;
	}
	
	.brick{
		height: var(--height);
		box-sizing: border-box;
		margin: 4px 6%;
		border-radius: 10px;
		background-color: var(--color);
	}
</style>