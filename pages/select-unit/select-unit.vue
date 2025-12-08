<template>
  <view class="container">

    <!-- 搜索框 -->
    <view class="search-box">
      <input class="search-input"
        v-model="searchKeyword"
        placeholder="搜索作业区、站点或井场..."
        @input="filterData"
      />
      <text class="search-icon">🔍</text>
    </view>

    <!-- 三列布局 -->
    <view class="three-columns">

      <!-- 作业区 -->
      <scroll-view scroll-y class="column">
        <view
          v-for="(area, aIndex) in filteredAreas"
          :key="area.name"
          class="item"
          :class="{ active: selectedAreaIndex === aIndex }"
          @click="selectArea(aIndex)"
        >
          {{ area.name }}
        </view>
      </scroll-view>

      <!-- 站点 -->
      <scroll-view scroll-y class="column">
        <view
          v-for="(station, sIndex) in stations"
          :key="station.name"
          class="item"
          :class="{ active: selectedStationIndex === sIndex }"
          @click="selectStation(sIndex)"
        >
          {{ station.name }}
        </view>
      </scroll-view>

      <!-- 井场 -->
      <scroll-view scroll-y class="column">
        <view
          v-for="(well, wIndex) in wells"
          :key="wIndex"
          class="item"
          :class="{ active: selectedWell === well }"
          @click="selectWell(well)"
        >
          {{ well }}
        </view>
      </scroll-view>

    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="confirm-btn" @click="confirmSelection" :disabled="!selectedWell">
        确认选择
      </button>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      selectedAreaIndex: null,
      selectedStationIndex: null,
      selectedWell: null,

      // 原始数据
      areas: [
        {
          name: "西北作业区",
          stations: [{ name: "站点E", wells: ["井场11"] }]
        },
        {
          name: "东南作业区",
          stations: [{ name: "站点F", wells: ["井场12"] }]
        },
        { name: "西南作业区", stations: [] },
        { name: "东北作业区", stations: [] },
        { name: "中部作业区", stations: [] },
        { name: "东部作业区", stations: [] },
        { name: "西部作业区", stations: [] },
        { name: "南部作业区", stations: [] },
        { name: "北部作业区", stations: [] },
        { name: "中心作业区", stations: [] }
      ],

      filteredAreas: [],
      stations: [],
      wells: []
    };
  },

  created() {
    this.filteredAreas = this.areas;
  },

  methods: {
    // ---- 搜索过滤 ----
   filterData() {
     const key = this.searchKeyword.trim();
   
     // 重置选中项
     this.selectedAreaIndex = null;
     this.selectedStationIndex = null;
     this.selectedWell = null;
   
     // 无关键字 → 恢复默认
     if (!key) {
       this.filteredAreas = this.areas;
       this.stations = [];
       this.wells = [];
       return;
     }
   
     // -----------（1）作业区匹配：正常筛选）-----------
     this.filteredAreas = this.areas.filter(area =>
       area.name.includes(key) ||
       area.stations.some(s => s.name.includes(key)) ||
       area.stations.some(s => s.wells.some(w => w.includes(key)))
     );
   
     // ----------（2）站点匹配：搜索站点→直接显示第二列）----------
     let matchedStations = [];
   
     this.areas.forEach(area => {
       area.stations.forEach(station => {
         if (station.name.includes(key)) {
           matchedStations.push({
             area: area.name,
             station: station.name,
             wells: station.wells
           });
         }
       });
     });
   
     if (matchedStations.length > 0) {
       // 只显示匹配的站点
       this.stations = matchedStations.map(s => ({ name: s.station, wells: s.wells }));
       this.wells = [];
   
       // 自动定位第一个匹配站点所属作业区
       const first = matchedStations[0];
   
       this.selectedAreaIndex = this.areas.findIndex(a => a.name === first.area);
       this.selectedStationIndex = 0; // 显示匹配站点第一个即可
   
       return;
     }
   
     // ----------（3）井场匹配：第三列直接显示井场）----------
     let matchedWells = [];
   
     this.areas.forEach(area => {
       area.stations.forEach(station => {
         const wells = station.wells.filter(w => w.includes(key));
         if (wells.length > 0) {
           wells.forEach(w => {
             matchedWells.push({
               area: area.name,
               station: station.name,
               well: w
             });
           });
         }
       });
     });
   
     if (matchedWells.length > 0) {
       this.wells = matchedWells.map(i => i.well);
       this.stations = [];
   
       const first = matchedWells[0];
       this.selectedAreaIndex = this.areas.findIndex(a => a.name === first.area);
   
       const areaObj = this.areas[this.selectedAreaIndex];
       this.stations = areaObj.stations;
   
       this.selectedStationIndex = areaObj.stations.findIndex(
         s => s.name === first.station
       );
   
       return;
     }
   
     // -----------（无站点/井场匹配，只过滤作业区）-----------
     this.stations = [];
     this.wells = [];
   },
    // ---- 选择作业区 ----
    selectArea(index) {
      this.selectedAreaIndex = index;
      this.selectedStationIndex = null;
      this.selectedWell = null;

      this.stations = this.filteredAreas[index].stations;
      this.wells = [];
    },

    // ---- 选择站点 ----
    selectStation(index) {
      this.selectedStationIndex = index;
      this.selectedWell = null;

      this.wells = this.stations[index].wells;
    },

    // ---- 选择井场 ----
    selectWell(well) {
      this.selectedWell = well;
    },

    // ---- 确认按钮 ----
   confirmSelection() {
     if (!this.selectedWell) return;
   
     const area = this.filteredAreas[this.selectedAreaIndex].name;
     const station = this.stations[this.selectedStationIndex].name;
     const well = this.selectedWell;
   
     uni.setStorageSync("selectedUnit", { area, station, well });
   
     uni.switchTab({
       url: '/pages/add-check/add-check'
     });
   }

  }
};
</script>

<style>
/* 整体布局 */
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* 搜索框 */
.search-box {
  position: relative;
  padding: 20rpx;
}

.search-input {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  background: #f8f8f8;
  padding: 0 80rpx 0 30rpx;
  font-size: 28rpx;
}

.search-icon {
  position: absolute;
  right: 50rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 34rpx;
  color: #555;
}

/* 三列布局 */
.three-columns {
  flex: 1;
  display: flex;
}

.column {
  width: 33.33%;
  border-right: 1rpx solid #eee;
  background: #fafafa;
}

.item {
  padding: 32rpx;
  font-size: 30rpx;
  color: #333;
  border-bottom: 1rpx solid #eee;
}

.item.active {
  background: #e8f1ff;
  color: #2a6bf3;
  font-weight: bold;
}

/* 底部按钮 */
.bottom-bar {
  height: 120rpx;
  padding: 20rpx;
  border-top: 1rpx solid #eee;
  background: #fff;
}

.confirm-btn {
  width: 100%;
  height: 80rpx;
  background: #3b82f6;
  color: #fff;
  border: none;
  line-height: 80rpx;
  font-size: 32rpx;
  border-radius: 12rpx;
}

.confirm-btn:disabled {
  background: #ccc;
}
</style>
