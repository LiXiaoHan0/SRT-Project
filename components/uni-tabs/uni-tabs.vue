<template>
		<view class="uni-tabs">

			<!-- 导航 -->
			<view class="tabs" v-for="(item,indexNav) in tabnav" :key="item.name" @click="clickTab(indexNav)">
				<text class="text" :style="index === item.type ? optStyle:optStyleElse" >{{item.name}}</text>
			</view>

			<!-- 进度 -->
			<view class="speed" :style="'left:'+index*(tabWid / tabnav.length)+'px;width:'+(tabWid / tabnav.length)+'px'">
				<view class="speed-box" :style="'width:'+ (lineW || (tabWid / tabnav.length * 0.5))+'px;'"></view>
			</view>
		</view>

</template>

<script>
	export default {
		name: 'uni-tabs',
		emits:['click'],
		props:{
			// 线条宽度 单位px
			lineW:{
				type: Number,
				default: 0
			},
            // 选中的文字样式
            optStyle:{
                type: String,
                default: 'color: #660874;'
            },// 其他未选中的文字样式
            optStyleElse:{
                type: String,
                default: 'color: #999999;'
            },
			// 菜单导航
			tabnav: {
				type: Array,
				default:[]
			}
		},
		data() {
			return {
                tabWid:750,// 组件宽度
				index: 0, // 当前选择
			};
		},
		created() {
			this.tabWid=uni.getWindowInfo().screenWidth
		},
		methods: {
			clickTab(i) {
				if(this.index!=i){
					this.index = i
					this.$emit('click',i)
				}
			},
		}
	}
</script>

<style lang="scss">
	.uni-tabs {
		height: 40px;
		line-height: 60px;
		background: #FFF;
		position: fixed;
		width: 100%;
		left: 0px;
		top: 0px;
		z-index: 1;

		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		justify-content: space-around;
		.speed {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100px;
			transition: left 0.3s;

			align-items: center;

			.speed-box {
				margin: auto;
				height: 3px;
				background: #660874;
				border-radius: 6px;
			}
		}

		.tabs {
			width: 100px;
			text-align: center;

			.text {
				text-align: center;
				font-size: 14px;
				font-weight: 400;
                transition: all 0.3s;
			}
		}
	}
</style>
