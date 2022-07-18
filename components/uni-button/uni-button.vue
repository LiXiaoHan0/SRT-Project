<template>
	<view class="buttons" hover-class="buttons-hover" :style="parameter" hover-stay-time="100" @click="press">
		<slot /> 
	</view> 
</template>

<script>
	export default {
		name: "uni-button",
		data() {
			return {}
		},
		props: {
			type: { // 内置样式
				type: String,
				default: 'normal'
			},
			bgcolor: {
				type: String,
				default: '#660874'
			},
			bordcolor:{
				type: String,
				default: '#ffffff00'
			},
			hovercolor: {
				type: String,
				default: '#D93379'
			},
		},
		computed: {
			parameter() {
				const parameter = {
					'--bg-color': this.bgcolor,
					'--hover-color': this.hovercolor,
					'--bord-color':this.bordcolor
				}
				switch (this.type) {
					case 'green':
						parameter['--bg-color'] = '#00BF00'
						parameter['--hover-color'] = '#008C00'
						break;
					case 'red':
						parameter['--bg-color'] = '#EB3341'
						parameter['--hover-color'] = '#B82834'
						break
					case 'blue':
						parameter['--bg-color'] = '#009FFF'
						parameter['--hover-color'] = '#007ECC'
						break
				}
				return parameter
			}
		},
		emits: ['click'],
		methods: {
			press(e) {
				this.$emit('click', e)
			}
		}
	}
</script>

<style scoped lang="scss">
	
	@keyframes ripple {
		@for $i from 0 to 11{
			#{$i*10%} {
				background-image: radial-gradient(circle at center, var(--hover-color) #{$i*10%} , var(--bg-color));
			}
		}
	}

	.buttons {
		padding: 8px 16px;
		border-radius: 10px;
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
		border: var(--bord-color) solid 3px;

		color: #FFFFFF;
		text-align: center;
		font: bold 18px $body-font-family;
		background: var(--bg-color);

		transform: scale(1);
		transition: transform calc(50ms);
		transition-timing-function: ease-in-out;
	}

	.buttons-hover {
		transform: scale(0.98);
		animation: ripple 100ms ease-in-out forwards;
	}
</style>
