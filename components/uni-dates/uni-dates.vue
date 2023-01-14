<template>
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
		<view class="weeks" v-for="(item,weekIndex) in weeks" :key="weekIndex">
			<view class="weeks-day" :class="classes[weeks.form*((1<<weeks.text&states)?2:1)]" v-for="weeks in item" :key="weeks.text">
				<text style="font-size:14px;">{{weeks.text}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from './utils.js'
	export default {
		name:"uni-dates",
		data() {
			return {
				lock:true,
				now:{
					y:new Date().getFullYear(),
					m:new Date().getMonth()+1
				},
				states:0,
				weeks:null,
				classes:['week_grey','week_green','week_red']
			};
		},
		created(){
			this.switchMonth(this.now)
		},
		emits: ['change'],
		methods:{
			// 刷新日历数据
			refreshTime(){
				this.$emit('change',this.now)
			},
			// 重新生成日历
			switchMonth({y,m}){
				console.log(y,m)
				this.states=0
				this.weeks=[[]]
				// 计算必要常量
				var p_day=0
				var this_month=utils.getDays(y,m)
				var pre_month=utils.getDays(y,m-1)
				var first_week=utils.getWeek(y,m,1)
				
				// 生成日期信息
				const p=this.weeks
				
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
			}
		}
	}
</script>

<style lang="scss">
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
</style>