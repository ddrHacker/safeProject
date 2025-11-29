<template>
  <view class="container">
    <!-- 标题 -->
    <view class="header">质量安全环保监督检查系统</view>

    <!-- 现场检查 -->
    <view class="card">
      <view class="section-title">现场检查</view>
      <view class="photo-list">
        <view v-for="(item, index) in photos" :key="index" class="photo-item">
          <image v-if="item" :src="item" class="photo-preview" />
          <text v-if="item" class="delete-btn" @click="removePhoto(index)">×</text>
          <view v-else class="photo-placeholder" @click="choosePhoto">
            <text class="icon">📷</text>
            <text>点击拍照</text>
          </view>
        </view>
      </view>
      <button class="start-ai" @click="startAI">开始检查</button>
    </view>

    <!-- 基本信息 -->
    <view class="card">
      <view class="section-title">基本信息</view>
      <view class="form-item">
        <text class="label">检查日期</text>
        <picker mode="date" :value="checkDate" @change="e => checkDate = e.detail.value">
          <view class="picker-value">{{ checkDate }}</view>
        </picker>
      </view>
      <!-- <view class="form-item">
        <text class="label">被检查单位</text>
        <picker :value="unitIndex" :range="unitList" @change="e => unitIndex = e.detail.value">
          <view class="picker-value">{{ unitList[unitIndex] }}</view>
        </picker>
      </view> -->
		<view class="form-item">
		  <text class="label">被检查单位 (作业区-站点-井场)</text>
		  <!-- 修改为 multiSelector 模式 -->
		  <picker 
			mode="multiSelector" 
			:range="multiArray" 
			:value="multiIndex" 
			@columnchange="onColumnChange" 
			@change="onPickerChange"
		  >
			<!-- 显示选中的完整路径，如果没有选则提示 -->
			<view class="picker-value" :class="{placeholder: !unitLabel}">
			  {{ unitLabel || '点击选择被检查单位' }}
			</view>
		  </picker>
		</view>
			
      <view class="form-item">
        <text class="label">检查人</text>
        <input class="input" v-model="inspector" placeholder="请输入检查人" />
      </view>
      <view class="form-item">
        <text class="label">问题类型</text>
        <picker :value="problemIndex" :range="problemTypes" @change="e => problemIndex = e.detail.value">
          <view class="picker-value">{{ problemTypes[problemIndex] }}</view>
        </picker>
      </view>
    </view>

    <!-- AI识别结果 -->
    <view class="card">
      <view class="section-title">AI识别结果</view>
      <view v-if="aiResults.length === 0" class="empty-ai">暂无识别结果，请点击开始检查</view>

      <view v-for="(item, index) in aiResults" :key="index" class="ai-item">
        <view class="ai-header">
          <!-- <checkbox v-model="item.checked" /> -->
		  <view class="check-box" :class="{checked: item.checked}" @click="toggleCheck(index)"></view>
          <text class="ai-title">不符合项 {{ index + 1 }}</text>
        </view>
        <view class="ai-text">{{ item.desc }}</view>
        <view class="ai-std">依据：{{ item.rule }}</view>
        <view class="ai-suggest">整改建议：{{ item.suggest }}</view>
      </view>
    </view>

    <!-- 整改信息 -->
    <view class="card">
      <view class="section-title">整改信息</view>
      <view class="form-item">
        <text class="label">整改截止日期</text>
        <picker mode="date" :value="fixDate" @change="e => fixDate = e.detail.value">
          <view class="picker-value">{{ fixDate }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">责任人</text>
        <input class="input" v-model="dutyPerson" placeholder="请输入责任人" />
      </view>
    </view>

    <!-- 按钮 -->
    <view class="btn-group">
      <button @click="saveDraft">保存草稿</button>
      <button class="submit" @click="submitForm">提交检查</button>
    </view>
  </view>
</template>

<script>
// 模拟三级联动数据源 (实际开发中通常由后端API获取)
const UNIT_DATA = [
  {
    name: '第一作业区',
    children: [
      {
        name: '中心站A',
        children: ['井场A-01', '井场A-02', '井场A-03']
      },
      {
        name: '集气站B',
        children: ['井场B-01', '井场B-02']
      }
    ]
  },
  {
    name: '第二作业区',
    children: [
      {
        name: '增压站C',
        children: ['井场C-10', '井场C-11']
      },
      {
        name: '处理站D',
        children: ['井场D-05', '井场D-06', '井场D-07']
      }
    ]
  }
];

export default {
  data() {
    return {
      photos: [null, null, null, null],
      checkDate: this.getToday(),
      fixDate: this.getToday(),
      
      // --- 三级联动相关数据 Start ---
      unitLabel: '', //用于显示的最终字符串
      multiArray: [[], [], []], // picker显示的二维数组：[作业区数组, 站点数组, 井场数组]
      multiIndex: [0, 0, 0], // 当前选中的索引
      unitTree: UNIT_DATA, // 源数据
      // --- 三级联动相关数据 End ---

      inspector: '',
      problemTypes: ['选择问题类型', '消防安全', '设备隐患'],
      problemIndex: 0,
      dutyPerson: '',
      aiResults: []
    }
  },
  created() {
    // 初始化联动数据
    this.initPickerData();
  },
  methods: {
    // --- 三级联动核心逻辑 Start ---
    initPickerData() {
      // 1. 获取第一列（作业区）
      const areas = this.unitTree.map(item => item.name);
      
      // 2. 获取默认第一列对应的第二列（站点）
      const stations = this.unitTree[0].children.map(item => item.name);
      
      // 3. 获取默认第一、二列对应的第三列（井场）
      const wells = this.unitTree[0].children[0].children;

      // 赋值给组件
      this.multiArray = [areas, stations, wells];
      this.multiIndex = [0, 0, 0];
    },

    // 列改变时触发（滚动某一列时）
    onColumnChange(e) {
      const column = e.detail.column; // 改变的列（0, 1, 2）
      const value = e.detail.value;   // 改变后的索引
      
      // 更新当前索引状态
      this.multiIndex[column] = value;

      // 处理联动
      if (column === 0) {
        // 【第一列变了】：重置第二列和第三列
        const currentArea = this.unitTree[value];
        const newStations = currentArea.children.map(item => item.name);
        // 默认取新站点的第一个对应的井场
        const newWells = currentArea.children[0].children;

        this.multiArray = [this.multiArray[0], newStations, newWells];
        this.multiIndex = [value, 0, 0]; // 重置后两列索引为0
      } 
      else if (column === 1) {
        // 【第二列变了】：重置第三列
        const areaIndex = this.multiIndex[0]; // 获取当前第一列选的谁
        const currentStation = this.unitTree[areaIndex].children[value];
        const newWells = currentStation.children;

        this.multiArray = [this.multiArray[0], this.multiArray[1], newWells];
        this.multiIndex = [areaIndex, value, 0]; // 重置第三列索引为0
      }
      // 第三列变化不需要特殊处理，只需要记录 index 即可
      this.$forceUpdate(); // 强制刷新视图（以防万一）
    },

    // 点击确定按钮时触发
    onPickerChange(e) {
      this.multiIndex = e.detail.value;
      const [i, j, k] = this.multiIndex;
      
      // 防御性编程，防止数组越界
      const area = this.multiArray[0][i] || '';
      const station = this.multiArray[1][j] || '';
      const well = this.multiArray[2][k] || '';
      
      // 拼接显示文本
      this.unitLabel = `${area} - ${station} - ${well}`;
    },
    // --- 三级联动核心逻辑 End ---

    getToday() {
      let d = new Date();
      return d.toISOString().split('T')[0]
    },
    choosePhoto() {
      uni.chooseImage({ count: 1, success: res => {
        for (let i = 0; i < this.photos.length; i++) {
          if (!this.photos[i]) {
            this.photos[i] = res.tempFilePaths[0]
            // 强制更新视图，有时候数组直接赋值Vue检测不到
            this.$forceUpdate(); 
            break
          }
        }
      }})
    },
    removePhoto(i) {
      // 使用 Vue.set 或者 splice 保证响应式，或者直接赋值后 forceUpdate
      this.photos.splice(i, 1, null);
    },
    startAI() {
      uni.showLoading({ title: 'AI识别中...' });
      setTimeout(() => {
        uni.hideLoading();
        this.aiResults = [
          { desc: '灭火器压力不足，存在安全隐患', rule: 'GB 50140-2005 第5.1.3条', suggest: '及时更换压力不足灭火器', checked: false },
          { desc: '安全通道被杂物阻塞', rule: 'AQ 3013-2008 第6.2.1条', suggest: '立即清理通道杂物', checked: false }
        ]
      }, 1000);
    },
    saveDraft() {
      uni.showToast({title: '已保存草稿', icon: 'none'})
    },
    toggleCheck(index) {
      this.aiResults[index].checked = !this.aiResults[index].checked
    },
    submitForm() {
      const selected = this.aiResults.filter(i => i.checked)
      
      // 校验单位是否已选
      if (!this.unitLabel) return uni.showToast({title: '请选择被检查单位', icon: 'none'})
      
      if (selected.length === 0 && this.aiResults.length > 0) {
         return uni.showToast({title: '请确认AI识别的问题', icon: 'none'})
      }

      // 清空
      this.photos = [null, null, null, null];
      this.aiResults = [];
      this.unitLabel = ''; // 重置单位
      this.inspector = '';
      
      uni.showToast({title: '提交成功'})
    }
  }
}
</script>

<style>
.container { padding: 20rpx; }
.header { font-size: 36rpx; font-weight: bold; text-align: center; margin-bottom: 20rpx; color:#fff; background:#3b82f6; padding:20rpx 0; border-radius:12rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 20rpx; box-shadow:0 4rpx 10rpx rgba(0,0,0,0.1); }
.section-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; }
.photo-list { display: flex; justify-content: space-between; }
.photo-item { width: 22%; height: 160rpx; position: relative; }
.photo-placeholder { width: 100%; height: 100%; border: 2rpx dashed #bbb; display:flex; flex-direction:column; justify-content:center; align-items:center; border-radius: 12rpx; }
.photo-preview { width: 100%; height: 100%; border-radius: 12rpx; }
.delete-btn { position:absolute; top:0; right:0; background:red; color:#fff; border-radius:50%; width:40rpx; height:40rpx; text-align:center; line-height:40rpx; }
.form-item { margin-bottom: 20rpx; }
.label { font-size: 28rpx; margin-bottom: 10rpx; display:block; }
/* .picker-value { padding: 16rpx; background:#f5f5f5; border-radius: 10rpx; } */
.ai-item { padding: 20rpx; margin-bottom: 20rpx; background:#f9fafb; border-radius: 14rpx; }
.ai-header { display:flex; align-items:center; margin-bottom:10rpx; }
.ai-title { margin-left: 10rpx; font-weight: bold; }
.btn-group { display: flex; justify-content: space-between; margin-bottom: 40rpx; }
.submit { background:#3b82f6; color:#fff; }
.start-ai { margin-top: 20rpx; background:#3b82f6; color:#fff; }
.input {
  padding: 20rpx 24rpx;
  height: 88rpx;               /* 明确指定高度，使所有框一致 */
  line-height: 48rpx;
  background: #f5f6f8;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04);
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  width: 100%;
  border: none;
}
.picker-value {
  padding: 20rpx 24rpx;
  height: 88rpx;
  line-height: 48rpx;
  background: #f5f6f8;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04);
  font-size: 28rpx;
  color: #333;
  width: 100%;
  box-sizing: border-box;
}
.check-box {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ccc;
  border-radius: 4rpx;
  margin-right: 16rpx;
  background-color: #fff;
  transition: 0.2s;
}

.check-box.checked {
  background-color: #007AFF;
  border-color: #007AFF;
  position: relative;
}

.check-box.checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-size: 22rpx;
  color: #fff;
}

/* 在原有的 style 中添加 */
.picker-value.placeholder {
  color: #999; /* 未选择时显示灰色 */
}
</style>