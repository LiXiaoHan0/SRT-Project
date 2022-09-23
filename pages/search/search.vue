<template>
	<view class="topbar">
		<uni-search-bar radius="5" placeholder="请输入用户姓名" 
		 clearButton="auto" cancelButton="none" :maxlength="10"
		 v-model="searchValue" focus 
		 @confirm="comfirmSearch" @cancel="clearSearch" @clear="clearSearch" />
	</view>
	<uni-list>
		<uni-list-item v-for="item in searchData" :key="item._id" 
		:title="item.nickname" :note="'最后登陆时间：'+changeTime(item.last_login_date)" 
		:thumb="item.avatar" thumb-size="lg" rightText="详细信息" 
		showArrow clickable @click="goProfile(item._id)" />
	</uni-list>
</template>

<script>
	const db = uniCloud.database()
	import utils from '../../common/utils.js'
	export default {
		data() {
			return {
				searchValue:'',
				searchData:[]
			};
		},
		methods:{
			// 确认进行搜索
			comfirmSearch(e){
				uni.showLoading({mask:true})
				db.collection('uni-id-users').where(`${new RegExp('.*'+e.value+'.*')}.test(nickname) && role[0]=="USER"`).field('nickname,avatar,last_login_date').get().then(({result})=>{
					console.log(result)
					this.searchData=result.data
					uni.hideLoading()
				}).catch(err => {
					console.log(err)
					uni.hideLoading()
					uni.showToast({
						icon: 'error',
						title: '服务器请求错误'
					})
				})
			},
			// 取消搜索内容
			clearSearch(){
				this.searchValue=''
				this.searchData=[]
			},
			goProfile(id){
				uni.navigateTo({
					url:`../show/show?type=profile&text=用户详细信息&id=${id}&item=设置管理员`
				})
			},
			// 时间处理函数
			changeTime(t){
				return utils.changeTime(t)
			}
		}
	}
</script>

<style lang="scss">
	.topbar{
		padding: 2px 10px;
		background-color:#fff;
	}
</style>
