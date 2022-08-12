<template>
	<view class="state" :style="color[type][0]">
		<view class="icon" :style="color[type][1]"></view>
		<!-- <text class="word">{{text}}</text> -->
		<text class="word">{{212}}</text>
	</view>
</template>

<script>
	export default {
		name: "uni-state",
		props: {
			// 标签类型 good,bad
			type: {
				type: String,
				default: "good"
			},
			// 标签内容
			text: {
				type: String,
				default: ""
			},
		},
		computed: {
			color() {
				return {
					good: [{
						'background-color': '#00BF00'
					}, {
						'background-color': '#008C00'
					}],
					bad: [{
						'background-color': '#EB3341'
					}, {
						'background-color': '#B82834'
					}]
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.state {
		display: flex;
		width:60px;
		padding: 4px 7px;
		border-radius: 10px;
	}

	.icon {
		width: 8px;
		height: 8px;
		margin: 3px;
		border-radius: 50%;
		box-shadow: 0 0 5px #fff
	}

	.word {
		color: #fff;
		font-size: 12px;
		font-weight: 300;
		line-height: 14px;
	}
</style>
