<template>
  <div class="quality-safety-stats">
    <!-- 时间段选择 -->
    <div class="time-range-selector">
      <button 
        v-for="range in timeRanges" 
        :key="range.value"
        @click="selectTimeRange(range.value)"
        :class="{ active: selectedRange === range.value }"
      >
        {{ range.label }}
      </button>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-title">问题总数</div>
        <div class="stat-value">{{ currentStats.totalProblems }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-title">整改率</div>
        <div class="stat-value">{{ currentStats.rectificationRate }}%</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-title">平均整改天数</div>
        <div class="stat-value">{{ currentStats.avgRectificationDays }}</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-title">延期问题</div>
        <div class="stat-value">{{ currentStats.delayedProblems }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QualitySafetyStats',
  data() {
    return {
      selectedRange: 'month', // 默认选中近一个月
      timeRanges: [
        { label: '近一天', value: 'day' },
        { label: '近一周', value: 'week' },
        { label: '近一月', value: 'month' }
      ],
      // 模拟数据 - 实际项目中应该从API获取
      statsData: {
        day: {
          totalProblems: 28,
          rectificationRate: 82.5,
          avgRectificationDays: 3.8,
          delayedProblems: 3
        },
        week: {
          totalProblems: 89,
          rectificationRate: 79.2,
          avgRectificationDays: 4.1,
          delayedProblems: 8
        },
        month: {
          totalProblems: 142,
          rectificationRate: 76.8,
          avgRectificationDays: 4.2,
          delayedProblems: 12
        }
      }
    };
  },
  computed: {
    currentStats() {
      return this.statsData[this.selectedRange] || this.statsData.month;
    }
  },
  methods: {
    selectTimeRange(range) {
      this.selectedRange = range;
      // 在实际应用中，这里应该调用API获取对应时间段的数据
      // this.fetchStatsData(range);
    },
    
    // 模拟API调用方法
    async fetchStatsData(timeRange) {
      try {
        // 实际API调用代码
        // const response = await this.$http.get(`/api/stats?range=${timeRange}`);
        // this.statsData[timeRange] = response.data;
        
        // 这里使用模拟数据更新
        console.log(`Fetching data for ${timeRange} range`);
        
        // 可以根据实际需求更新数据
        // 例如：模拟数据变化
        if (timeRange === 'day') {
          this.$set(this.statsData, 'day', {
            totalProblems: Math.floor(Math.random() * 50) + 20,
            rectificationRate: (Math.random() * 20 + 70).toFixed(1),
            avgRectificationDays: (Math.random() * 2 + 3).toFixed(1),
            delayedProblems: Math.floor(Math.random() * 10)
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats data:', error);
      }
    }
  },
  mounted() {
    // 组件加载时获取初始数据
    this.fetchStatsData(this.selectedRange);
  }
};
</script>

<style scoped>
.quality-safety-stats {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.time-range-selector {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

.time-range-selector button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.time-range-selector button:hover {
  background-color: #e8e8e8;
}

.time-range-selector button.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .time-range-selector {
    flex-direction: column;
  }
}
</style>