<template>
  <view class="page">
    <view class="title">问题详情</view>

    <view class="block">
      <view class="row"><text>标题：</text>{{ detail.title }}</view>
      <view class="row"><text>检查日期：</text>{{ detail.checkDate }}</view>
      <view class="row"><text>单位：</text>{{ detail.unit }}</view>
      <view class="row"><text>负责人：</text>{{ detail.responsible }}</view>
      <view class="row"><text>类型：</text>{{ detail.type }}</view>
    </view>

    <view class="block">
      <view class="sub-title">不符合项描述</view>
      <view class="content">{{ detail.description }}</view>

      <view class="sub-title">依据条款</view>
      <view class="content">{{ detail.rule }}</view>

      <view class="sub-title">整改建议</view>
      <view class="content">{{ detail.suggestion }}</view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const detail = ref({
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
	"isOverdue": true,
	"description": "现场发现灭火器压力不足",
	"rule": "第一条",
	"suggestion": "整改"
})

onLoad((options) => {
  const id = options.id

  uni.request({
    url: 'http://your-api/issue/detail',
    data: { id },
    success: (res) => {
      detail.value = res.data
    }
  })
})
</script>

<style scoped>
.page {
  padding: 30rpx;
}
.title {
  font-size: 38rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.block {
  background: white;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
}
.row {
  font-size: 30rpx;
  margin-bottom: 14rpx;
}
.sub-title {
  font-weight: bold;
  font-size: 32rpx;
  margin-top: 20rpx;
  margin-bottom: 10rpx;
}
.content {
  font-size: 28rpx;
  color: #444;
}
</style>
