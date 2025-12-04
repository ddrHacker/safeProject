// 定义所有可能的 tab 页面
const allTabs = {
	problem: {
		pagePath: "/pages/issue-list/issue-list",
		text: "问题列表",
		iconPath: "/static/tab-home.png",
		selectedIconPath: "/static/tab-home-active.png"
	},
	add: {
		pagePath: "/pages/add-check/add-check",
		text: "新增检查",
		iconPath: "/static/tab-check.png",
		selectedIconPath: "/static/tab-check-active.png"
	},
	chart: {
		pagePath: "/pages/index/index",
		text: "统计分析",
		iconPath: "/static/tab-chart.png",
		selectedIconPath: "/static/tab-chart-active.png"
	},
	mine: {
		pagePath: "/pages/index/index",
		text: "我的",
		iconPath: "/static/tab-mine.png",
		selectedIconPath: "/static/tab-mine-active.png"
	}
}

// 导出根据角色获取菜单的方法
export const getTabBarByRole = (role) => {
	if (role === 'inspector') {
		// 检查人员：3个Tab
		return [allTabs.problem, allTabs.add, allTabs.chart,allTabs.mine]
	} else {
		// 被检查方或其他：2个Tab
		return [allTabs.problem, allTabs.mine]
	}
}