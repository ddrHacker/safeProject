<template>
  <view class="page">

    <!-- 顶部 tabs -->
    <view class="tabs">
      <view 
        v-for="(tab,i) in tabs" 
        :key="i"
        :class="['tab', currentTab===i?'active':'']"
        @click="currentTab=i; loadData(i);"
      >
        {{ tab }}
      </view>
    </view>

    <!-- 问题卡片列表 -->
    <view class="issue-card" 
      v-for="item in issueList" 
      :key="item.id"
      @click="goDetail(item)"
    >
      <view class="title">
        #{{ item.id }} {{ item.title }}
        <text class="status" :class="statusClass(item.status)">
          {{ item.statusText }}
        </text>
      </view>

      <view class="info-row">
        <text>检查日期：{{ item.checkDate }}</text>
        <text>被检查单位：{{ item.unit }}</text>
      </view>

      <view class="info-row">
        <text>问题类型：{{ item.type }}</text>
        <text>负责人：{{ item.responsible }}</text>
      </view>

      <view class="desc">{{ item.shortDesc }}</view>

      <view class="deadline" :class="item.isOverdue ? 'overdue' : ''">
        整改截止：{{ item.deadline }}
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue'

const tabs = ['全部问题', '已整改', '未整改', '超时未整改']
const currentTab = ref(0)

const issueList = ref([])

// 加载后端数据
const loadData = (idx) => {
	// console.log(idx),
	issueList.value = [
    {
      "id": 1,
      "title": "消防设施检查",
      "checkDate": "2023-10-15",
      "unit": "西北作业区-站点A-井场3",
      "type": "消防安全",
      "responsible": "张工",
      "shortDesc": "现场发现灭火器压力不足...",
      "deadline": "2023-10-20",
      "status": "overdue",
      "statusText": "超时未整改",
      "isOverdue": true
    },
	{
	  "id": 2,
	  "title": "消防设施检查",
	  "checkDate": "2026-10-15",
	  "unit": "西北作业区-站点A-井场3",
	  "type": "消防安全",
	  "responsible": "张工",
	  "shortDesc": "现场发现灭火器压力不足...",
	  "deadline": "2026-10-20",
	  "status": "done",
	  "statusText": "已整改",
	  "isOverdue": false
	}
  ],
  uni.request({
    url: 'http://your-api/issues',
    method: 'GET',
    data: {
      status: currentTab.value
    },
    success: (res) => {
      issueList.value = res.data.list
    }
  })
}

// 状态颜色 class
const statusClass = (status) => {
  if (status === 'done') return 'status-done'
  if (status === 'overdue') return 'status-overdue'
  return 'status-doing'
}

// 跳转详情页
const goDetail = (item) => {
  uni.navigateTo({
    url: '/pages/issue-detail/issue-detail?id=' + item.id
  })
}

loadData(0)
</script>

<style scoped>
.page {
  padding: 20rpx;
}

/* 顶部tabs */
.tabs {
  display: flex;
  background: #f3f5f9;
  padding: 10rpx;
  border-radius: 16rpx;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;
}
.tab.active {
  background: white;
  border-radius: 12rpx;
  color: #2b8cff;
}

/* 卡片 */
.issue-card {
  background: white;
  margin-top: 20rpx;
  padding: 30rpx;
  border-radius: 18rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.title {
  font-weight: 600;
  font-size: 32rpx;
  display: flex;
  justify-content: space-between;
}
.status {
  font-size: 26rpx;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
}
.status-done {
  background: #e1f7e7;
  color: #3cb371;
}
.status-doing {
  background: #ffe9c5;
  color: #ff8f00;
}
.status-overdue {
  background: #ffd6d8;
  color: #ff4d4f;
}

.info-row {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #666;
  display: flex;
  justify-content: space-between;
}

.desc {
  margin-top: 16rpx;
  color: #444;
  font-size: 26rpx;
}

.deadline {
  margin-top: 18rpx;
  color: #3cb371;
  font-size: 26rpx;
  font-weight: bold;
}
.deadline.overdue {
  color: #ff4d4f;
}
</style>
