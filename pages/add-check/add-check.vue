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
      
      <!-- 修改单位选择部分 -->
      <view class="form-item">
        <text class="label">被检查单位 (作业区-站点-井场)</text>
        <view class="picker-value" @click="goSelectUnit">
          {{ unitLabel || '点击选择被检查单位' }}
        </view>
      </view>
      
      <view class="form-item">
        <text class="label">责任部门</text>
        <input class="input" v-model="inspector" placeholder="请输入责任部门" />
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
      <view class="section-header">
        <view class="section-title" style="margin-bottom:0;">AI识别结果</view>
        <view class="add-manual-btn" @click="openManualModal">+ 手动添加</view>
      </view>
      
      <view v-if="aiResults.length === 0" class="empty-ai">暂无识别结果，请点击开始检查或手动添加</view>

      <view v-for="(item, index) in aiResults" :key="index" class="ai-item">
        <view class="ai-header">
          <view class="check-box" :class="{checked: item.checked}" @click="toggleCheck(index)"></view>
          <text class="ai-title">不符合项 {{ index + 1 }}</text>
          <text v-if="item.isManual" class="delete-text" @click.stop="removeResult(index)">删除</text>
        </view>
        <view class="ai-text"><strong>隐患描述：</strong>{{ item.desc }}</view>
        <view class="ai-std"><strong>检查依据：</strong>{{ item.rule }}</view>
        <view class="ai-suggest"><strong>整改建议：</strong>{{ item.suggest }}</view>
      </view>
    </view>

    <!-- 手动添加弹窗 -->
    <view class="modal-mask" v-if="showManualModal" @click.stop="">
      <view class="modal-content">
        <view class="modal-title">手动添加不符合项</view>
        
        <view class="form-item">
          <text class="label">隐患描述</text>
          <textarea class="input textarea" v-model="manualForm.desc" placeholder="请输入具体隐患情况" />
        </view>
        
        <view class="form-item">
          <text class="label">参考法规 (选择)</text>
          <view class="picker-value" @click="goSelectLaw">
            {{ manualForm.rule || '点击选择参考法规' }}
          </view>
        </view>
        
        <view class="form-item">
          <text class="label">整改建议</text>
          <input class="input" v-model="manualForm.suggest" placeholder="请输入整改建议" />
        </view>

        <view class="modal-btns">
          <button class="cancel-btn" @click="closeManualModal">取消</button>
          <button class="confirm-btn" @click="confirmManualAdd">确定添加</button>
        </view>
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
    <my-tabbar currentPath="/pages/add-check/add-check"></my-tabbar>
  </view>
</template>

<script>
import MyTabbar from '@/components/my-tabbar/my-tabbar.vue'

export default {
  components: { MyTabbar },
  onShow() {
    uni.hideTabBar({ animation: false })
    // 从选择单位页面返回时，检查是否有选中的单位
    const selectedUnit = uni.getStorageSync('selectedUnit');
    if (selectedUnit) {
      this.unitLabel = `${selectedUnit.area}-${selectedUnit.station}-${selectedUnit.well}`;
      uni.removeStorageSync('selectedUnit');
    }
    
    // 从法律法规选择页面返回时，检查是否有选中的法规
    const selectedLaw = uni.getStorageSync('selectedLaw');
    if (selectedLaw) {
      this.manualForm.rule = selectedLaw;
      uni.removeStorageSync('selectedLaw');
    }
  },
  
  data() {
    return {
      photos: [null, null, null, null],
      checkDate: this.getToday(),
      fixDate: this.getToday(),
      unitLabel: '', // 显示选中的单位
      inspector: '',
      problemTypes: ['选择问题类型', '设备管理','电力设施','应急管理','消防安全','安全设施','污染防治','职业健康','工艺安全','生产运行','仪器仪表','数字化','三违行为','能力意识','作业许可','承包商','交通安全','基础工作','能量隔离','化学药品','隐蔽工程'],
      problemIndex: 0,
      dutyPerson: '',
      aiResults: [],
      showManualModal: false,
      manualForm: {
        desc: '',
        rule: '', // 存储选中的法规，不是索引
        suggest: ''
      }
    }
  },
  methods: {
    getToday() {
      let d = new Date();
      return d.toISOString().split('T')[0]
    },
    
    // 跳转到选择单位页面
    goSelectUnit() {
      uni.navigateTo({
        url: '/pages/select-unit/select-unit'
      });
    },
    
    // 跳转到选择法律法规页面
    goSelectLaw() {
      uni.navigateTo({
        url: '/pages/select-law/select-law'
      });
    },
    
    choosePhoto() {
      uni.chooseImage({ count: 1, success: res => {
        for (let i = 0; i < this.photos.length; i++) {
          if (!this.photos[i]) {
            this.photos[i] = res.tempFilePaths[0]
            this.$forceUpdate();
            break
          }
        }
      }})
    },
    
    removePhoto(i) {
      this.photos.splice(i, 1, null);
    },
    
    startAI() {
      if (this.photos.filter(p => p).length === 0) {
        return uni.showToast({ title: '请先上传照片', icon: 'none' });
      }
    
      uni.showLoading({ title: 'AI识别中...' });
    
      const files = this.photos
        .filter(p => p)
        .map((path, index) => ({ name: `file${index}`, uri: path }));
    
      uni.uploadFile({
        url: uni.$baseUrl+'/appv1/startai/',
        files: files,
        name: 'file',
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.status !== 200) {
              uni.showToast({ title: '识别失败', icon: 'none' });
              return;
            }
            this.aiResults = data.results.map(item => ({
              desc: item.desc,
              rule: item.rule,
              suggest: item.suggest,
              checked: false
            }));
          } catch (e) {
            console.error("解析错误", e);
            uni.showToast({ title: '结果解析失败', icon: 'none' });
          }
        },
        fail: (err) => {
          console.log("请求失败: ", err);
          uni.showToast({ title: 'AI识别失败', icon: 'none' });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    },
    
    saveDraft() {
      uni.showToast({title: '已保存草稿', icon: 'none'})
    },
    
    toggleCheck(index) {
      this.aiResults[index].checked = !this.aiResults[index].checked
    },
    
    submitForm() {
      const selected = this.aiResults.filter(i => i.checked);
      const files = this.photos
        .filter(p => p)
        .map((path, index) => ({ name: `file${index}`, uri: path }));
        
      if (files.length === 0) return uni.showToast({title: '请添加现场检查图片', icon: 'none'})
      if (!this.unitLabel) return uni.showToast({title: '请选择被检查单位', icon: 'none'})
      if (!this.inspector) return uni.showToast({title: '请输入检查人', icon: 'none'})
      if (!this.dutyPerson) return uni.showToast({title: '请输入责任人', icon: 'none'})
      if (this.problemIndex === 0) return uni.showToast({title: '请选择问题类型', icon: 'none'})
      
      if (selected.length === 0 && this.aiResults.length > 0) {
        return uni.showToast({title: '请确认AI识别的问题', icon: 'none'})
      }
      
      // 清空
      this.photos = [null, null, null, null];
      this.aiResults = [];
      this.unitLabel = '';
      this.inspector = '';
      this.dutyPerson = '';
      this.problemIndex = 0;
      this.manualForm = {
        desc: '',
        rule: '',
        suggest: ''
      };
      
      uni.showToast({title: '提交成功'})
    },
    
    openManualModal() {
      this.manualForm = {
        desc: '',
        rule: '',
        suggest: ''
      };
      this.showManualModal = true;
    },
    
    closeManualModal() {
      this.showManualModal = false;
    },
    
    confirmManualAdd() {
      const { desc, rule, suggest } = this.manualForm;
      
      if (!desc) return uni.showToast({title:'请输入隐患描述', icon:'none'});
      if (!rule) return uni.showToast({title:'请选择参考法规', icon:'none'});
      if (!suggest) return uni.showToast({title:'请输入整改建议', icon:'none'});

      const newItem = {
        desc: desc,
        rule: rule,
        suggest: suggest,
        checked: true,
        isManual: true
      };

      this.aiResults.push(newItem);
      this.showManualModal = false;
      uni.showToast({title: '添加成功'});
    },
    
    removeResult(index) {
      uni.showModal({
        title: '提示',
        content: '确定删除该项吗？',
        success: (res) => {
          if (res.confirm) {
            this.aiResults.splice(index, 1);
          }
        }
      })
    }
  }
}
</script>

<style>
/* 原有样式保持不变，只添加一个样式用于点击选择 */
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

.picker-value:active {
  background-color: #e8e9eb;
}

/* 当没有选择时的占位符样式 */
.picker-value:empty:before {
  content: '点击选择被检查单位';
  color: #999;
}


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
.ai-item { padding: 20rpx; margin-bottom: 20rpx; background:#f9fafb; border-radius: 14rpx; }
.ai-header { display:flex; align-items:center; margin-bottom:10rpx; }
.ai-title { margin-left: 10rpx; font-weight: bold; }
.btn-group { display: flex; justify-content: space-between; margin-bottom: 40rpx; }
.submit { background:#3b82f6; color:#fff; }
.start-ai { margin-top: 20rpx; background:#3b82f6; color:#fff; }
.input {
  padding: 20rpx 24rpx;
  height: 88rpx;
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
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.add-manual-btn {
  font-size: 26rpx;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  background-color: #eff6ff;
}
.add-manual-btn:active {
  background-color: #dbeafe;
}
.empty-ai {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  padding: 30rpx 0;
}
.delete-text {
  font-size: 24rpx;
  color: #ff4d4f;
  margin-left: auto;
  padding: 10rpx;
}
.textarea {
  height: 160rpx;
  width: 100%;
}
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  width: 80%;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  animation: popUp 0.2s ease-out;
}
@keyframes popUp {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
  color: #333;
}
.modal-btns {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}
.cancel-btn, .confirm-btn {
  width: 45%;
  font-size: 30rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
}
.cancel-btn {
  background: #f5f5f5;
  color: #666;
}
.confirm-btn {
  background: #3b82f6;
  color: #fff;
}
</style>