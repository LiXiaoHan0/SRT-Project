<template>
	<view>
		<view style="background-color: #fff;">
			<!-- 头部栏 -->
			<view class="header">
				<view class="header-btn-box" @click.stop="preMonth">
					<view class="header-btn" style="transform: rotate(-45deg);"></view>
				</view>
				<text class="header-text">{{now.y+' / '+(now.m<10?'0':'')+now.m}}</text>
				<view class="header-btn-box" @click.stop="nextMonth">
					<view class="header-btn" style="transform: rotate(135deg);"></view>
				</view>
				<text class="backtoday" @click="backToday">本月</text>
			</view>
			<!-- 星期栏 -->
			<view class="weeks adorn">
				<view v-for="day in ['日','一','二','三','四','五','六']" :key="day" class="weeks-day">
					<text style="font-size:14px;">{{day}}</text>
				</view>
			</view>
			<!-- 日期栏 -->
			<view class="weeks" v-for="(item,weekIndex) in weeks" :key="''+now.y+now.m+weekIndex">
				<view class="weeks-day" v-for="week in item" :key="week.text+(week.form<<5)"
				:class="classes[week.form*((1<<week.text&states?2:1))]" @touchstart="changeState(week)">
					<text style="font-size:14px;">{{week.text}}</text>
				</view>
			</view>
		</view>
		<!-- 逻辑栏 -->
		<view v-if="lock" style="margin: 30px 60px">
			<uni-button @click="changeDate">修改开放预约时间</uni-button>
		</view>
		<view v-else class="buttun_box">
			<uni-button type="green" @click="comfirmDate">确定修改</uni-button>
			<uni-button type="red" @click="cancelDate">取消修改</uni-button>
		</view>
	</view>
</template>

<script>
	import utils from './utils.js'
	import uniButton from './../uni-button/uni-button.vue'
	export default {
		name:"uni-dates",
		components: {
			uniButton
		},
		data() {
			return {
				lock:true,
				now:{
					y:new Date().getFullYear(),
					m:new Date().getMonth()+1
				},
				states:0,
				backup:0,
				weeks:[[]],
				classes:['week_grey','week_green','week_red']
			};
		},
		created(){
			this.switchMonth(this.now)
		},
		emits: ['changeMonth','changeState'],
		methods:{
			// 刷新日历数据
			refreshTime(){
				this.$emit('changeMonth',this.now)
			},
			// 重新生成日历
			switchMonth({y,m}){
				console.log(y,m)
				this.states=0
				
				// 计算必要常量
				var p_day=0
				var this_month=utils.getDays(y,m)
				var pre_month=utils.getDays(y,m-1)
				var first_week=utils.getWeek(y,m,1)
				
				// 生成日期信息
				const p=[[]]
				
					// 开头周
					for(let i=1;i<=first_week;i++){
						p[0].push({
							text:pre_month-first_week+i,
							form:0
						})
					}
					for(let i=1;i<8-first_week;i++){
						p[0].push({
							text:i,
							form:1
						})
					}
					p_day+=(7-first_week)
					
					// 中间周
					while(this_month-p_day>7){
						const tmp=[]
						for(let i=1;i<8;i++){
							tmp.push({
								text:p_day+i,
								form:1
							})
						}
						p_day+=7
						p.push(tmp)
					}
					
					// 结尾周
					var t=this_month-p_day,tmp=[]
					for(let i=1;i<=t;i++){
						tmp.push({
							text:p_day+i,
							form:1
						})
					}
					for(let i=1;i<8-t;i++){
						tmp.push({
							text:i,
							form:0
						})
					}
					p.push(tmp)
					
				this.weeks=p
			},
			// 上一个月
			preMonth(){
				if(--this.now.m==0){
					this.now.m=12
					--this.now.y
				}
				this.switchMonth(this.now)
				this.refreshTime()
			},
			// 下一个月
			nextMonth(){
				if(++this.now.m==13){
					this.now.m=1
					++this.now.y
				}
				this.switchMonth(this.now)
				this.refreshTime()
			},
			// 回到本月
			backToday(){
				this.now={
					y:new Date().getFullYear(),
					m:new Date().getMonth()+1
				}
				this.switchMonth(this.now)
				this.refreshTime()
			},
			// 修改开放时间
			changeDate(){
				this.lock=false
				uni.showToast({
					title:'点击日期切换状态',
					icon:'none'
				})
			},
			// 确定修改
			comfirmDate(){
				uni.showModal({
					title: '提示',
					content: '确定要修改开放日期吗？\n时间冲突的预约将被取消',
				}).then(res=>{
					if (res.confirm) {
						console.log('确定修改',this.states);
						this.$emit('changeState',this.now,this.states)
					}
				})
			},
			// 取消修改
			cancelDate(){
				this.lock=true
				this.states=this.backup
			},
			// 点击切换状态
			changeState({text,form}){
				if(!this.lock&&form){
					console.log(text)
					this.states^=(1<<text)
				}
			},
			// 更新日历状态
			refreshState(t){
				this.lock=true
				this.states=t
				this.backup=t
			}
		}
	}
</script>

<style lang="scss" scoped>
	// 头部栏
	.header{
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		height: 50px;
	}
	.header-btn-box{
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 50px;
		height: 50px;
	}
	.header-btn{
		width: 10px;
		height: 10px;
		border-style: solid;
		border-color: #808080;
		border-width: 2px 0 0 2px;
	}
	.backtoday {
		position: absolute;
		right: 0;
		top: 12px;
		padding: 0 5px;
		padding-left: 10px;
		height: 26px;
		line-height: 26px;
		font-size: 12px;
		border-radius: 25px 0 0 25px;
		background-color: #EEE;
	}
	
	// 星期栏
	.weeks{
		position: relative;
		display: flex;
		flex-direction: row;
	}
	.adorn{
		border-color:#f8f8f8;
		border-width: 2px 0;
		border-style: solid;
	}
	.weeks-day {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 45px;
	}
	.week_grey{
		color: #CCCCCC;
		background-color: #f8f8f8;
	}
	.week_red{
		color: #fff;
		background-color: #EB3341;
	}
	.week_green{
		color: #fff;
		background-color: #00BF00;
	}
	
	// 逻辑栏
	.buttun_box{
		margin:30px 12px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content:space-around;
	}
</style>