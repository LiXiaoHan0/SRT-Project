<template>
	<view @click="onClick" :style="{width,height}">
		<image v-if="cSrc" :style="{width,height}" :src="cSrc" :mode="mode"></image>
	</view>
</template>

<script>
	export default {
		name: "cloud-image",
		emits:['click','switchChange'],
		props: {
			mode: {
				type:String,
				default () {
					return 'widthFix'
				}
			},
			src: {
				// type:String,
				default () {
					return ""
				}
			},
			width: {
				type:String,
				default () {
					return '80px'
				}
			},
			height: {
				type:String,
				default () {
					return '80px'
				}
			}
		},
		watch: {
			src:{
				handler(src) {
					// console.log(src);
					// console.log(src.substring(0, 8));
					if (src&&src.substring(0, 8) == "cloud://") {
						uniCloud.getTempFileURL({
							fileList: [src]
						}).then(res=>{
							// console.log(res);
							this.cSrc = res.fileList[0].tempFileURL
						})
					}else{
						this.cSrc = src
					}
				},
				immediate: true
			}
		},
		async mounted() {

		},
		methods:{
			onClick(){
				this.$emit('click')
			}
		},
		data() {
			return {
				cSrc:false
			};
		}
	}
</script>