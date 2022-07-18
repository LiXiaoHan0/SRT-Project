<script>
	import initApp from '@/common/appInit.js';
	export default {
		onLaunch: function() {
			console.log('App Launch')
			initApp()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@mixin flexbox($direction) {
		display: flex;
		flex-direction: $direction;
		justify-content: center;
		align-items: center;
	}
	
	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}
	
	.topbar {
		height: var(--status-bar-height);
		width: 100%;
	}
	
	.row-flex {
		@include flexbox(row)
	}
	
	.col-flex {
		@include flexbox(column)
	}
</style>
