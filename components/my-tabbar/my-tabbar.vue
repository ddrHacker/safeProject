<template>
	<view class="tabbar-container">
		<!-- 占位符，防止内容被底部遮挡 -->
		<view class="tabbar-placeholder"></view>
		
		<view class="tabbar">
			<view 
				class="tabbar-item" 
				v-for="(item, index) in tabList" 
				:key="index" 
				@click="switchTab(item)"
			>
				<image 
					class="icon" 
					:src="currentPath === item.pagePath ? item.selectedIconPath : item.iconPath" 
				/>
				<text 
					class="text"
					:class="{ active: currentPath === item.pagePath }"
				>
					{{ item.text }}
				</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { getTabBarByRole } from '@/utils/tabBar.js'
	
	export default {
		props: {
			// 父页面传入当前的路径，用于高亮判断
			currentPath: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				tabList: []
			}
		},
		created() {
			// 1. 获取用户信息/角色 (假设存在本地缓存)
			// const role = uni.getStorageSync('userRole') || 'guest';
			const role = 'inspector';
			// 2. 根据角色生成菜单
			this.tabList = getTabBarByRole(role);
			
			// 3. 隐藏原生 TabBar (关键步骤)
			uni.hideTabBar();
		},
		methods: {
			switchTab(item) {
				// 如果点击当前页，不处理
				if (this.currentPath === item.pagePath) return;
				
				// 使用 switchTab 跳转
				uni.switchTab({
					url: item.pagePath
				})
			}
		}
	}
</script>

<style scoped>
	.tabbar-container {
		position: relative;
		z-index: 999;
	}
	/* 真实显示的 TabBar */
	.tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100rpx; /* 50px */
		background-color: #ffffff;
		display: flex;
		border-top: 1rpx solid #eeeeee;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
	}
	.tabbar-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.icon {
		width: 48rpx;
		height: 48rpx;
		margin-bottom: 4rpx;
	}
	.text {
		font-size: 20rpx;
		color: #999999;
	}
	.text.active {
		color: #3b82f6; /* 选中颜色 */
	}
	
	/* 占位符，高度与 tabbar 一致，用于把页面内容顶上去 */
	.tabbar-placeholder {
		height: 100rpx;
		width: 100%;
	}
</style>