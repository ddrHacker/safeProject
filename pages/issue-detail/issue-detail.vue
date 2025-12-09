<template>
  <view class="page">
    
    <view class="title">检查信息</view>

    <view class="card">
      <view class="card-title">检查信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">检查日期：</text>
          <text class="info-value">{{ detail.checkDate }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">检查人：</text>
          <text class="info-value">{{ detail.checker }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">姓名：</text>
          <text class="info-value">{{ detail.name }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">性别：</text>
          <text class="info-value">{{ detail.gender }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">年龄：</text>
          <text class="info-value">{{ detail.age }}</text>
        </view>
      </view>
    </view>

    <view class="divider"></view>

    <view class="card">
      <view class="card-title">问题详情</view>
      <view class="problem-content">
        {{ detail.problemDesc }}
      </view>
    </view>

    <view class="card">
      <view class="card-title">问题条款</view>
      <view class="standard-content">
        {{ detail.standard }}
      </view>
    </view>

    <view class="card">
      <view class="card-title">检查照片</view>
      <view class="photos-container">
        <view 
          class="photo-item" 
          v-for="(photo, index) in detail.photos" 
          :key="index"
        >
          <image 
            :src="photo" 
            mode="aspectFill" 
            class="photo-image"
            @click="previewImage(index)"
          />
          <text class="photo-label">照片 {{ index + 1 }}</text>
        </view>
      </view>
    </view>

    <view 
      class="card" 
      v-for="(rectification, index) in detail.rectifications" 
      :key="'rect-' + index"
    >
      <view class="card-title">整改信息 ({{ index + 1 }})</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">整改截止日期：</text>
          <text class="info-value">{{ rectification.deadline }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">整改完成时间：</text>
          <text class="info-value">{{ rectification.fixDate }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">整改人员：</text>
          <text class="info-value">{{ rectification.fixer }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">复查时间：</text>
          <text class="info-value">{{ rectification.anotherDate || '待复查' }}</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">审核状态</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">当前状态：</text>
          <text class="status-text" :class="getStatusClass(detail.auditStatus)">
            {{ detail.auditStatus }}
          </text>
        </view>
        <view class="info-item">
          <text class="info-label">审核时间：</text>
          <text class="info-value">{{ detail.auditTime || 'N/A' }}</text>
        </view>
      </view>
    </view>

    <view class="card" v-if="detail.extension.applicant">
      <view class="card-title">延期申请记录</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">申请人：</text>
          <text class="info-value">{{ detail.extension.applicant }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">审核时间 1：</text>
          <text class="info-value">{{ detail.extension.reviewDate1 }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">审核时间 2：</text>
          <text class="info-value">{{ detail.extension.reviewDate2 }}</text>
        </view>
      </view>
      <view class="extension-reason">
        <text class="info-label" style="display: block; width: 100%;">延期原因说明：</text>
        {{ detail.extension.reason }}
      </view>
    </view>

    <view class="card action-card">
      <view class="card-title">操作</view>
      
      <view class="action-buttons">
        <button 
          type="primary" 
          class="action-button extension-btn"
          @click="showExtensionModal = true"
        >
          申请延期
        </button>
        
        <button 
          type="default" 
          class="action-button rework-btn"
          @click="applyRework"
        >
          重新整改
        </button>
      </view>
    </view>

    <view class="modal-overlay" v-if="showExtensionModal" @tap="showExtensionModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">申请延期</text>
          <text class="modal-close" @tap="showExtensionModal = false">×</text>
        </view>
        
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">延期天数：</text>
            <input 
              type="number" 
              v-model.number="extensionDaysInput" 
              placeholder="请输入延期天数" 
              class="days-input"
              min="1"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">延期原因：</text>
            <textarea 
              v-model="extensionReason" 
              placeholder="请输入延期原因" 
              class="reason-textarea"
              maxlength="200"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">预计完成日期：</text>
            <text class="expected-date">{{ calculateExpectedDate() }}</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <button 
            type="default" 
            class="modal-btn cancel-btn"
            @tap="showExtensionModal = false"
          >
            取消
          </button>
          <button 
            type="primary" 
            class="modal-btn confirm-btn"
            @tap="submitExtension"
          >
            提交申请
          </button>
        </view>
      </view>
    </view>

    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 模拟数据 (请替换为实际数据结构)
const detail = ref({
  id: "ISSUE20231015",
  checkDate: "2023-10-15",
  checker: "安全检查员",
  name: "李俊",
  gender: "女",
  age: "30岁",
  problemDesc: "现场发现灭火器压力不足，部分消防栓被药物阻挡，安全通道被放物料，存在严重安全隐患。根据A识别结果，该区域存在多处不符合安全规范的情况。",
  standard: "GB 50140-2005 - 第5.1.3条 灭火器温度在位置明显低于现场的温度，且不影响安全部位，对有损坏的灭火器造成危险，应设置防灭火措施。",
  photos: [
    "https://cdn.pixabay.com/photo/2016/06/17/08/33/fire-extinguisher-1463125_960_720.jpg", // 模拟图片
    "https://cdn.pixabay.com/photo/2019/04/09/16/01/fire-hydrant-4115160_960_720.jpg", // 模拟图片
    "https://cdn.pixabay.com/photo/2014/12/28/19/21/exit-582539_960_720.jpg" // 模拟图片
  ],
  rectifications: [
    {
      deadline: "2023-10-20",
      fixDate: "2023-10-22",
      fixer: "张工",
      anotherDate: "2023-10-23"
    }
  ],
  auditStatus: "审核不通过",
  auditTime: "2023-10-23",
  extension: {
    applicant: "张工",
    reviewDate1: "2023-10-18",
    reviewDate2: "2023-10-19",
    reason: "因等待专用灭火器配件到货，需要延长整改时间5天，配件已于10月20日到货，整改工作于10月22日完成。"
  }
})

// 延期申请相关
const showExtensionModal = ref(false)
const extensionDaysInput = ref(5) // 默认5天
const extensionReason = ref("")
const successMessage = ref("")
const currentIssueId = ref(null)

onLoad((options) => {
  if (options.id) {
    currentIssueId.value = options.id
    // 实际API调用
    uni.request({
      url: 'http://your-api/issue/detail',
      data: { id: options.id },
      success: (res) => {
        // 假设API返回的数据覆盖了模拟数据
        // detail.value = { ...detail.value, ...res.data }
      },
      fail: (err) => {
        console.error('获取详情失败:', err)
        uni.showToast({ title: '加载失败', icon: 'error' })
      }
    })
  }
})

// 图片预览
const previewImage = (index) => {
  uni.previewImage({
    current: index,
    urls: detail.value.photos
  })
}

// 获取状态样式类
const getStatusClass = (status) => {
  if (status === '审核通过') return 'status-pass'
  if (status === '审核不通过') return 'status-fail'
  if (status === '待审核') return 'status-pending'
  return ''
}

// 重新整改
const applyRework = () => {
  uni.showModal({
    title: '重新整改',
    content: '确定要重新整改吗？重新整改将重新开始整改流程。',
    success: (res) => {
      if (res.confirm) {
        // 调用API提交重新整改申请
        uni.request({
          url: 'http://your-api/issue/rework',
          method: 'POST',
          data: { issueId: detail.value.id },
          success: (res) => {
            uni.showToast({ title: "重新整改申请已提交", icon: 'success' })
            // 提交成功后返回当前页面，实现刷新
            setTimeout(() => {
              uni.redirectTo({
                url: `/pages/issue/detail?id=${detail.value.id}`
              })
            }, 1000)
          },
          fail: (err) => {
            uni.showToast({ title: '提交失败', icon: 'error' })
          }
        })
      }
    }
  })
}

// 计算预计完成日期
const calculateExpectedDate = () => {
  const days = parseInt(extensionDaysInput.value)
  if (isNaN(days) || days <= 0) {
    return '请输入有效天数'
  }
  
  // 从最后一个整改截止日期开始计算
  const baseDate = detail.value.rectifications.length > 0 
    ? new Date(detail.value.rectifications[detail.value.rectifications.length - 1].deadline)
    : new Date()
  
  const resultDate = new Date(baseDate)
  resultDate.setDate(resultDate.getDate() + days)
  
  return resultDate.toISOString().split('T')[0]
}

// 提交延期申请
const submitExtension = () => {
  const days = parseInt(extensionDaysInput.value)
  
  if (isNaN(days) || days <= 0) {
    uni.showToast({ title: '延期天数必须是大于0的数字', icon: 'none' })
    return
  }
  
  if (!extensionReason.value.trim()) {
    uni.showToast({ title: '请输入延期原因', icon: 'none' })
    return
  }
  
  // 调用API提交延期申请
  uni.request({
    url: 'http://your-api/issue/extension',
    method: 'POST',
    data: { 
      issueId: detail.value.id,
      extensionDays: days,
      extensionReason: extensionReason.value,
      expectedDate: calculateExpectedDate()
    },
    success: (res) => {
      uni.showToast({ title: "延期申请已提交", icon: 'success' })
      showExtensionModal.value = false
      
      // 清空表单
      extensionReason.value = ""
      extensionDaysInput.value = 5
      
      // 提交成功后返回当前页面，实现刷新
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/issue/detail?id=${detail.value.id}`
        })
      }, 1000)
    },
    fail: (err) => {
      uni.showToast({ title: '提交失败', icon: 'error' })
    }
  })
}
</script>

<style scoped>
.page {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin: 20rpx 0 30rpx 0;
  color: #333;
}

.card {
  background: white;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  color: #333;
  border-left: 6rpx solid #1890ff;
  padding-left: 12rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 28rpx;
}

.info-label {
  color: #666;
  width: 180rpx;
  flex-shrink: 0;
}

.info-value {
  color: #333;
  flex: 1;
}

.problem-content,
.standard-content,
.extension-reason {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  padding: 10rpx 0;
}

.extension-reason .info-label {
    margin-bottom: 10rpx;
}

.photos-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 10rpx;
}

.photo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(33.33% - 14rpx); /* 3列布局 */
}

.photo-image {
  width: 100%;
  height: 150rpx;
  border-radius: 8rpx;
  background-color: #f0f0f0;
}

.photo-label {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}

.status-text {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 500;
}

.status-pass {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-fail {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.status-pending {
  background-color: #fffbe6;
  color: #faad14;
}

.action-card .action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 10rpx;
}

.action-button {
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 8rpx;
  font-size: 30rpx;
  border: none;
}

.action-button::after {
  border: none;
}

.extension-btn {
  background-color: #1890ff;
  color: white;
}

.rework-btn {
  background-color: #f5f5f5;
  color: #333;
  border: 1rpx solid #ddd;
}

.rework-btn:hover {
  background-color: #e8e8e8;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16rpx;
  width: 90%;
  max-width: 600rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  width: 40rpx;
  height: 40rpx;
  text-align: center;
  line-height: 40rpx;
}

.modal-body {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

/* 延期天数输入框样式 */
.days-input {
  width: 100%;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  border: 1rpx solid #ddd;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box; 
  text-align: left;
}

.reason-textarea {
  width: 100%;
  height: 150rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  border: 1rpx solid #ddd;
  font-size: 28rpx;
  box-sizing: border-box;
}

.expected-date {
  display: block;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  padding: 0 30rpx 30rpx 30rpx;
  gap: 20rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 8rpx;
  font-size: 30rpx;
  border: none;
}

.modal-btn::after {
  border: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
  border: 1rpx solid #ddd;
}

.confirm-btn {
  background-color: #1890ff;
  color: white;
}

.divider {
  height: 1rpx;
  background-color: #e8e8e8;
  margin: 30rpx 0;
}
</style>