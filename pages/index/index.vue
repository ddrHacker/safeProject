<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">图像检测功能</text>
      <text class="subtitle">Image Detection Demo</text>
    </view>

    <!-- 中间功能区 -->
    <view class="main-card">
      <view class="card-tag">功能执行区</view>
      
      <view class="panel-row">
        <!-- 左侧栏：上传 + 执行 -->
        <view class="left-panel">
          <!-- 上传框 -->
          <view class="upload-box" @click="chooseImage" hover-class="box-hover">
            <image v-if="imgSrc" :src="imgSrc" mode="aspectFit" class="preview-img"></image>
            <view v-else class="placeholder">
              <view class="icon-circle">
                <view class="icon-plus">+</view>
              </view>
              <text class="tip">点击上传图片</text>
            </view>
          </view>

          <!-- 执行按钮 -->
          <view class="btn-box" :class="{ 'btn-disabled': isRunning }" @click="executeTask" hover-class="btn-hover">
            <text class="btn-text">{{ isRunning ? '正在分析...' : '立即执行检测' }}</text>
          </view>
        </view>

        <!-- 右侧栏：结果展示 -->
        <view class="right-panel">
          <view class="result-box">
             <view class="result-content">
               <view class="visual-decoration">
                 <view class="circle c1"></view>
                 <view class="circle c2"></view>
               </view>
               <text class="result-title">可视化结果</text>
               <text class="result-sub">Result Visualization</text>
             </view>
          </view>
        </view>
      </view>
    </view>
    <view class="log-card">
      <view class="log-header">
        <text class="log-title">系统日志 / System Log</text>
      </view>
      <view class="log-body">
    
        <text class="log-placeholder">暂无日志输出...</text>
      </view>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      imgSrc: '',          
      isRunning: false
    }
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.imgSrc = res.tempFilePaths[0];
        }
      });
    },

    executeTask() {
      if (this.isRunning) return;
      
      if (!this.imgSrc) {
        uni.showToast({ title: '请先上传图片', icon: 'none' });
        return;
      }

      this.isRunning = true;
      
    }
  }
}
</script>

<style>
/* 全局背景 */
page {
  background-color: #f2f4f8; 
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 40rpx 30rpx;
  box-sizing: border-box;
  gap: 30rpx;
}

/* 1. 顶部标题 */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 900;
  color: #2c3e50;
  letter-spacing: 1px;
}
.subtitle {
  font-size: 22rpx;
  color: #95a5a6;
  margin-top: 8rpx;
  text-transform: uppercase;
  letter-spacing: 3px;
}

/* 2. 中间功能大卡片 */
.main-card {
  flex: 1;
  background-color: #ffffff;
  border-radius: 30rpx;
  padding: 50rpx 30rpx 30rpx 30rpx;
  position: relative;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.06); 
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255,255,255,0.8);
}

/* 左上角标签 */
.card-tag {
  position: absolute;
  top: 30rpx;
  left: 0;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  color: #fff;
  font-size: 22rpx;
  padding: 6rpx 20rpx 6rpx 24rpx;
  border-top-right-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  font-weight: 600;
  box-shadow: 4rpx 4rpx 10rpx rgba(79, 172, 254, 0.3);
}

.panel-row {
  display: flex;
  flex: 1;
  gap: 30rpx;
  margin-top: 20rpx;
}

/* 左侧栏 */
.left-panel {
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

/* 通用点击效果 */
.box-hover {
  opacity: 0.9;
  transform: scale(0.99);
}
.btn-hover {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.2);
}

/* 上传框  */
.upload-box {
  flex: 1.4;
  background-color: #f8faff;
  border: 3rpx dashed #dbe2ef;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: all 0.3s;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-circle {
  width: 90rpx;
  height: 90rpx;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.05);
  margin-bottom: 20rpx;
}

.icon-plus {
  font-size: 50rpx;
  color: #4facfe;
  font-weight: 300;
  margin-top: -6rpx;
}

.tip {
  font-size: 24rpx;
  color: #aab2bd;
  font-weight: 500;
}

.btn-box {
  flex: 1;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border-radius: 24rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 20rpx rgba(56, 249, 215, 0.3);
  transition: all 0.3s;
}



.btn-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.btn-disabled {
  background: #e0e0e0;
  box-shadow: none;
  cursor: not-allowed;
}

/* 右侧结果框 */
.right-panel {
  flex: 1;
  display: flex;
}

.result-box {
  width: 100%;
  background-color: #fdfdfd;
  border-radius: 24rpx;
  border: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

/* 装饰性圆圈 */
.visual-decoration {
  position: relative;
  width: 120rpx;
  height: 80rpx;
  margin-bottom: 30rpx;
}
.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
}
.c1 {
  width: 60rpx;
  height: 60rpx;
  background-color: #a18cd1;
  left: 20rpx;
  top: 0;
}
.c2 {
  width: 50rpx;
  height: 50rpx;
  background-color: #fbc2eb;
  right: 20rpx;
  bottom: 0;
}

.result-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #555;
  margin-bottom: 8rpx;
}
.result-sub {
  font-size: 20rpx;
  color: #ccc;
  letter-spacing: 1px;
}

/* 3. 底部日志区 */
.log-card {
  height: 220rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03);
}

.log-header {
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.log-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #34495e;
  position: relative;
  padding-left: 20rpx;
}
.log-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 24rpx;
  background-color: #4facfe;
  border-radius: 4rpx;
}

.log-body {
  flex: 1;
  background-color: #fafafa;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-placeholder {
  font-size: 24rpx;
  color: #dcdcdc;
  font-style: italic;
  letter-spacing: 1px;
}
</style>