<template>
  <view class="container">
    <!-- 标题 -->
    <view class="header">选择参考法规</view>
    
    <!-- 搜索框 -->
    <view class="search-box">
      <text class="search-icon">🔍</text>
      <input 
        class="search-input" 
        v-model="searchKeyword"
        placeholder="搜索法规、章节或条款..."
        @input="filterData"
      />
    </view>
    
    <!-- 三列布局 -->
    <view class="three-columns">
      <!-- 左侧：法规分类 -->
      <scroll-view scroll-y class="column left-column">
        <view
          v-for="(category, cIndex) in filteredCategories"
          :key="category.id"
          class="column-item"
          :class="{ active: selectedCategoryIndex === cIndex }"
          @click="selectCategory(cIndex)"
        >
          <view class="item-content">
            <text class="item-name">{{ category.name }}</text>
            <text v-if="selectedCategoryIndex === cIndex" class="item-arrow">▶</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 中间：法规章节 -->
      <scroll-view scroll-y class="column middle-column">
        <view
          v-for="(chapter, chIndex) in chapters"
          :key="chapter.id"
          class="column-item"
          :class="{ active: selectedChapterIndex === chIndex }"
          @click="selectChapter(chIndex)"
        >
          <view class="item-content">
            <text class="item-name">{{ chapter.name }}</text>
            <text v-if="selectedChapterIndex === chIndex" class="item-arrow">▶</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 右侧：条款列表 -->
      <scroll-view scroll-y class="column right-column">
        <view
          v-for="(clause, clIndex) in clauses"
          :key="clause.id"
          class="clause-item"
          :class="{ active: selectedClauseIndex === clIndex }"
          @click="selectClause(clIndex)"
        >
          <view class="clause-header">
            <text class="clause-title">{{ clause.title }}</text>
            <text v-if="selectedClauseIndex === clIndex" class="check-icon">✓</text>
          </view>
          <text class="clause-content">{{ clause.content }}</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="selected-info" v-if="selectedClause">
        <text class="selected-text">已选择：{{ selectedClause.title }}</text>
      </view>
      <button 
        class="confirm-btn" 
        @click="confirmSelection" 
        :disabled="selectedClauseIndex === null"
        :class="{ disabled: selectedClauseIndex === null }"
      >
        {{ selectedClauseIndex !== null ? '确认选择' : '请选择条款' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      selectedCategoryIndex: null,
      selectedChapterIndex: null,
      selectedClauseIndex: null,
      selectedClause: null,
      
      // 法律法规数据库
      categories: [
        {
          id: 1,
          name: "安全生产法律法规",
          chapters: [
            {
              id: 101,
              name: "安全生产法",
              clauses: [
                { 
                  id: 1001, 
                  title: "第三条 安全生产方针", 
                  content: "安全生产工作应当以人为本，坚持安全发展，坚持安全第一、预防为主、综合治理的方针。" 
                },
                { 
                  id: 1002, 
                  title: "第四条 安全生产责任制", 
                  content: "生产经营单位必须遵守本法和其他有关安全生产的法律、法规，加强安全生产管理，建立健全全员安全生产责任制和安全生产规章制度。" 
                },
                { 
                  id: 1003, 
                  title: "第二十一条 安全投入保障", 
                  content: "生产经营单位应当具备的安全生产条件所必需的资金投入，由生产经营单位的决策机构、主要负责人或者个人经营的投资人予以保证。" 
                }
              ]
            },
            {
              id: 102,
              name: "危险化学品安全管理条例",
              clauses: [
                { 
                  id: 2001, 
                  title: "第四条 危险化学品单位主体责任", 
                  content: "危险化学品单位是危险化学品安全管理的责任主体，应当依法加强危险化学品安全管理。" 
                },
                { 
                  id: 2002, 
                  title: "第二十条 安全评价", 
                  content: "生产、储存危险化学品的企业，应当委托具备国家规定资质条件的机构，对本企业的安全生产条件每3年进行一次安全评价。" 
                }
              ]
            }
          ]
        },
        {
          id: 2,
          name: "消防法律法规",
          chapters: [
            {
              id: 201,
              name: "消防法",
              clauses: [
                { 
                  id: 3001, 
                  title: "第五条 单位消防责任", 
                  content: "任何单位和个人都有维护消防安全、保护消防设施、预防火灾、报告火警的义务。" 
                },
                { 
                  id: 3002, 
                  title: "第十六条 消防安全职责", 
                  content: "机关、团体、企业、事业等单位应当落实消防安全责任制，制定本单位的消防安全制度、消防安全操作规程。" 
                }
              ]
            },
            {
              id: 202,
              name: "建筑设计防火规范",
              clauses: [
                { 
                  id: 4001, 
                  title: "第5.1.1条 防火分区", 
                  content: "民用建筑的耐火等级、最多允许层数和防火分区最大允许建筑面积应符合规范要求。" 
                },
                { 
                  id: 4002, 
                  title: "第6.7条 安全疏散", 
                  content: "建筑的安全出口和疏散门的数量、位置、宽度应符合疏散要求。" 
                }
              ]
            }
          ]
        },
        {
          id: 3,
          name: "职业健康法律法规",
          chapters: [
            {
              id: 301,
              name: "职业病防治法",
              clauses: [
                { 
                  id: 5001, 
                  title: "第四条 职业病防治责任", 
                  content: "用人单位应当为劳动者创造符合国家职业卫生标准和卫生要求的工作环境和条件。" 
                },
                { 
                  id: 5002, 
                  title: "第十五条 职业病危害告知", 
                  content: "产生职业病危害的用人单位，应当在醒目位置设置公告栏，公布有关职业病防治的规章制度、操作规程。" 
                }
              ]
            }
          ]
        },
        {
          id: 4,
          name: "环境保护法律法规",
          chapters: [
            {
              id: 401,
              name: "环境保护法",
              clauses: [
                { 
                  id: 6001, 
                  title: "第四十二条 污染治理", 
                  content: "排放污染物的企业事业单位和其他生产经营者，应当采取措施，防治在生产建设或者其他活动中产生的污染。" 
                }
              ]
            }
          ]
        },
        {
          id: 5,
          name: "石油化工行业标准",
          chapters: [
            {
              id: 501,
              name: "SY/T 6277-2005",
              clauses: [
                { 
                  id: 7001, 
                  title: "含硫油气田安全规程", 
                  content: "在含硫油气田进行作业，必须配备正压式空气呼吸器，并确保作业人员掌握使用方法。" 
                }
              ]
            },
            {
              id: 502,
              name: "GB 50160-2008",
              clauses: [
                { 
                  id: 8001, 
                  title: "石油化工企业设计防火规范", 
                  content: "石油化工企业总平面布置应根据工厂的生产流程及各组成部分的生产特点和火灾危险性，结合地形、风向等条件，合理布置。" 
                }
              ]
            }
          ]
        }
      ],
      
      filteredCategories: [],
      chapters: [],
      clauses: []
    }
  },
  
  created() {
    this.filteredCategories = this.categories;
  },
  
  methods: {
    // 搜索过滤
    filterData() {
      const keyword = this.searchKeyword.trim().toLowerCase();
      
      if (!keyword) {
        this.filteredCategories = this.categories;
        return;
      }
      
      // 深拷贝数据以便过滤
      const filtered = JSON.parse(JSON.stringify(this.categories));
      
      // 过滤分类
      const resultCategories = filtered.filter(category => {
        // 首先检查分类名称是否匹配
        if (category.name.toLowerCase().includes(keyword)) {
          return true;
        }
        
        // 检查章节名称是否匹配
        const matchedChapters = category.chapters.filter(chapter => {
          if (chapter.name.toLowerCase().includes(keyword)) {
            return true;
          }
          
          // 检查条款是否匹配
          const matchedClauses = chapter.clauses.filter(clause => {
            return clause.title.toLowerCase().includes(keyword) || 
                   clause.content.toLowerCase().includes(keyword);
          });
          
          if (matchedClauses.length > 0) {
            // 只保留匹配的条款
            chapter.clauses = matchedClauses;
            return true;
          }
          
          return false;
        });
        
        if (matchedChapters.length > 0) {
          // 只保留匹配的章节
          category.chapters = matchedChapters;
          return true;
        }
        
        return false;
      });
      
      this.filteredCategories = resultCategories;
      this.selectedCategoryIndex = resultCategories.length > 0 ? 0 : null;
      
      if (this.selectedCategoryIndex !== null) {
        this.chapters = resultCategories[0].chapters;
        this.selectedChapterIndex = this.chapters.length > 0 ? 0 : null;
        
        if (this.selectedChapterIndex !== null) {
          this.clauses = this.chapters[0].clauses;
          this.selectedClauseIndex = null;
          this.selectedClause = null;
        }
      }
    },
    
    // 选择分类
    selectCategory(index) {
      this.selectedCategoryIndex = index;
      this.selectedChapterIndex = null;
      this.selectedClauseIndex = null;
      this.selectedClause = null;
      this.chapters = this.filteredCategories[index].chapters;
      this.clauses = [];
      
      // 如果该分类下有章节，自动选择第一个章节
      if (this.chapters.length > 0) {
        this.selectedChapterIndex = 0;
        this.clauses = this.chapters[0].clauses;
      }
    },
    
    // 选择章节
    selectChapter(index) {
      this.selectedChapterIndex = index;
      this.selectedClauseIndex = null;
      this.selectedClause = null;
      this.clauses = this.chapters[index].clauses;
    },
    
    // 选择条款
    selectClause(index) {
      this.selectedClauseIndex = index;
      this.selectedClause = this.clauses[index];
    },
    
    // 确认选择
    confirmSelection() {
      if (this.selectedClauseIndex === null) {
        uni.showToast({
          title: '请先选择条款',
          icon: 'none'
        });
        return;
      }
      
      // 获取完整的法规信息
      const category = this.filteredCategories[this.selectedCategoryIndex];
      const chapter = this.chapters[this.selectedChapterIndex];
      const clause = this.selectedClause;
      
      // 格式化法规信息
      const lawInfo = `${category.name} - ${chapter.name} - ${clause.title}: ${clause.content}`;
      
      // 保存到本地存储
      uni.setStorageSync('selectedLaw', lawInfo);
      
      // 提示并返回
      uni.showToast({
        title: '选择成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          setTimeout(() => {
            uni.navigateBack();
          }, 150);
        }
      });
    }
  }
}
</script>

<style>
.container {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 标题 */
.header {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  padding: 30rpx 0;
  background: #3b82f6;
  color: #fff;
  flex-shrink: 0;
}

/* 搜索框 */
.search-box {
  position: relative;
  padding: 20rpx;
  background: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 40rpx;
  font-size: 32rpx;
  color: #666;
  z-index: 2;
}

.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 40rpx 0 80rpx;
  background: #f8f9fa;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: 1rpx solid #e0e0e0;
  box-sizing: border-box;
}

/* 三列布局 */
.three-columns {
  flex: 1;
  display: flex;
  background: #fff;
  overflow: hidden;
}

/* 列通用样式 */
.column {
  height: 100%;
  border-right: 1rpx solid #f0f0f0;
}

.left-column {
  width: 250rpx;
  flex-shrink: 0;
}

.middle-column {
  width: 300rpx;
  flex-shrink: 0;
}

.right-column {
  flex: 1;
  border-right: none;
}

/* 列项样式 */
.column-item {
  padding: 24rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.column-item.active {
  background: #e8f4ff;
  border-right: 4rpx solid #3b82f6;
}

.column-item:active:not(.active) {
  background-color: #f9f9f9;
}

.item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}

.column-item.active .item-name {
  color: #3b82f6;
  font-weight: 500;
}

.item-arrow {
  color: #3b82f6;
  font-size: 24rpx;
}

/* 条款样式 */
.clause-item {
  padding: 30rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.clause-item.active {
  background: #e8f4ff;
  border-left: 4rpx solid #3b82f6;
}

.clause-item:last-child {
  border-bottom: none;
}

.clause-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.clause-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  line-height: 1.4;
}

.clause-item.active .clause-title {
  color: #3b82f6;
}

.check-icon {
  color: #3b82f6;
  font-size: 36rpx;
  font-weight: bold;
  margin-left: 20rpx;
}

.clause-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #e0e0e0;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  z-index: 100;
}

.selected-info {
  text-align: center;
}

.selected-text {
  font-size: 26rpx;
  color: #3b82f6;
  font-weight: 500;
  background: #eff6ff;
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  display: inline-block;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #3b82f6;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 12rpx;
  border: none;
  transition: all 0.2s;
}

.confirm-btn.disabled {
  background: #ccc;
  color: #999;
}

.confirm-btn:not(.disabled):active {
  background: #2563eb;
  transform: scale(0.98);
}

/* 空状态提示 */
.no-data {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  padding: 40rpx 0;
}

.no-data-text {
  margin-top: 10rpx;
}

/* 滚动条样式优化 */
scroll-view {
  box-sizing: border-box;
}
</style>