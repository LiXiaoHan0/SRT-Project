// 上次启动时的用户信息
let userInfoHistory = uni.getStorageSync('userInfo') || {};
let state = {
		//是否已经登录
		hasLogin: Boolean(Object.keys(userInfoHistory).length),
		//用户信息
		info: userInfoHistory
	},
	getters = {
		info(state) {
			if (!state.hasLogin) {
				return {
					role: [],
					nickname: '未登录用户'
				}
			} else if (!state.info.mobile) {
				return {
					uid: state.info.uid,
					role: ['VISITOR'],
					nickname: '微信匿名用户'
				} 
			} else {
				return state.info
			}
		},
		hasLogin(state) {
			return state.hasLogin;
		}
	},
	mutations = {
		login(state, info) { //登录成功后的操作
			//原有的结合传来的参数
			let _info = state.info;
			state.info = Object.assign({}, _info, info);
			//设置为已经登录
			state.hasLogin = true;
			console.log('state.info', state.info);
			//存储最新的用户数据到本地持久化存储
			uni.setStorageSync('userInfo', state.info);
			if (info.token) {
				uni.setStorage({
					key: 'uni_id_token',
					data: state.info.token,
					complete(e) {
						console.log('setStorage-------',e);
					}
				});
				uni.setStorageSync('uni_id_token_expired', state.info.tokenExpired)
			}
		},
		logout(state) {
			state.info = {};
			state.hasLogin = false;
			uni.setStorageSync('userInfo', {});
			uni.removeStorageSync('uni_id_token');
			uni.setStorageSync('uni_id_token_expired', 0)
		}
	},
	actions = {
		logout(context) {
			uni.showLoading({
				mask: true
			})
			uniCloud.callFunction({
				name: 'uni-id-cf',
				data: {
					action: 'logout'
				},
				complete: (e) => {
					console.log(e);
					context.commit('logout')
					uni.hideLoading()
				}
			})
		}
	}
export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}
