<template>
  <view class="login-container">
    <view class="login-form">
      <text class="login-title">用户登录</text>
      
      <view class="input-group">
        <input 
          v-model="username" 
          placeholder="请输入用户名" 
          class="input-field"
          @confirm="handleLogin"
        />
        <input 
          v-model="password" 
          placeholder="请输入密码" 
          password
          class="input-field"
          @confirm="handleLogin"
        />
      </view>
      
      <!-- 测试账户提示 -->
      <view class="test-hint">
        <text class="hint-text">测试账户:</text>
        <text class="hint-account">检查人员: inspector / 123456</text>
        <text class="hint-account">被检查方: inspected / 123456</text>
        <text class="hint-account">检查主管: supervisor / 123456</text>
      </view>
      
      <button 
        class="login-btn" 
        @click="handleLogin"
        :disabled="loading"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
      
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      if (!this.username.trim()) {
        uni.showToast({ title: '请输入用户名', icon: 'none' });
        return;
      }
      if (!this.password.trim()) {
        uni.showToast({ title: '请输入密码', icon: 'none' });
        return;
      }
      
      this.loading = true;
      
      try {
        // 模拟登录验证
        setTimeout(() => {
          // 定义三种角色的测试账户
          const testAccounts = {
            // 检查人员（执行检查任务）
            'inspector': {
              password: '123456',
              userInfo: {
                userId: 1001,
                username: 'inspector',
                nickname: '张检查员',
                role: 'inspector',
                department: '安全检查部',
                permissions: ['add_check', 'view_issues', 'upload_photos']
              }
            },
            // 被检查方（接收检查结果）
            'inspected': {
              password: '123456',
              userInfo: {
                userId: 2001,
                username: 'inspected',
                nickname: '李被检方',
                role: 'inspected',
                company: '被检查单位',
                department: '安全管理部门',
                permissions: ['view_own_issues', 'confirm_issues', 'view_reports']
              }
            },
            // 检查主管（管理检查任务）
            'supervisor': {
              password: '123456',
              userInfo: {
                userId: 3001,
                username: 'supervisor',
                nickname: '王主管',
                role: 'supervisor',
                department: '安全监管部',
                permissions: ['manage_checks', 'view_all_issues', 'approve_reports', 'assign_tasks', 'statistics']
              }
            },
            // 备用测试账户
            'admin': {
              password: '123456',
              userInfo: {
                userId: 9999,
                username: 'admin',
                nickname: '系统管理员',
                role: 'admin',
                permissions: ['all']
              }
            }
          };
          
          const account = testAccounts[this.username];
          
          if (account && account.password === this.password) {
            // 登录成功处理
            uni.setStorageSync('token', 'token_' + Date.now() + '_' + this.username);
            uni.setStorageSync('userInfo', account.userInfo);
            
            // 显示欢迎信息
            const roleNames = {
              'inspector': '检查人员',
              'inspected': '被检查方',
              'supervisor': '检查主管',
              'admin': '系统管理员'
            };
            
            uni.showToast({ 
              title: `登录成功，欢迎${roleNames[account.userInfo.role] || '用户'}`,
              icon: 'success',
              duration: 2000
            });
            
            // 根据不同角色跳转到不同界面
            this.redirectByRole(account.userInfo.role);
            
          } else {
            // 登录失败
            uni.showToast({ 
              title: '用户名或密码错误', 
              icon: 'none',
              duration: 2000
            });
          }
          
          this.loading = false;
        }, 800);
        
      } catch (error) {
        uni.showToast({ 
          title: error.message || '登录失败', 
          icon: 'none' 
        });
        this.loading = false;
      }
    },
    
    // 根据角色跳转到不同界面
    redirectByRole(role) {
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        let targetPage = '';
        let navigationType = 'switchTab'; // 默认使用switchTab
        
        // 根据角色决定跳转到哪个页面
        switch(role) {
          case 'inspector':
            // 检查人员：主要负责新增检查任务
            targetPage = '/pages/add-check/add-check';
            navigationType = 'switchTab';
            console.log('检查人员 -> 新增检查页面');
            break;
            
          case 'inspected':
            // 被检查方：查看自己被检查出的问题
            targetPage = '/pages/issue-list/issue-list';
            navigationType = 'switchTab';
            console.log('被检查方 -> 问题列表页面');
            break;
            
          case 'supervisor':
            // 检查主管：查看所有检查任务和统计分析
            // 先跳转到问题列表，后续可以添加统计页面
            targetPage = '/pages/issue-list/issue-list';
            navigationType = 'switchTab';
            console.log('检查主管 -> 问题列表页面（待添加统计页面）');
            break;
            
          case 'admin':
            // 管理员：跳转到问题列表
            targetPage = '/pages/issue-list/issue-list';
            navigationType = 'switchTab';
            console.log('管理员 -> 问题列表页面');
            break;
            
          default:
            // 默认跳转到问题列表
            targetPage = '/pages/issue-list/issue-list';
            navigationType = 'switchTab';
            console.log('未知角色 -> 默认跳转到问题列表');
        }
        
        // 执行跳转
        if (navigationType === 'switchTab') {
          uni.switchTab({
            url: targetPage,
            success: () => {
              console.log('跳转到:', targetPage);
            },
            fail: (err) => {
              console.error('跳转失败:', err);
              // 跳转失败时使用reLaunch重试
              uni.reLaunch({
                url: targetPage
              });
            }
          });
        } else {
          uni.reLaunch({
            url: targetPage
          });
        }
      }, 1500); // 1.5秒后跳转
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
}

.login-form {
  background: white;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  width: 100%;
  max-width: 600rpx;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.1);
}

.login-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 40rpx;
  display: block;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-field {
  height: 100rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  margin-bottom: 30rpx;
  transition: all 0.3s;
  
  &:focus {
    border-color: #667eea;
  }
}

.test-hint {
  background: #f8f9fa;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 40rpx;
  border-left: 6rpx solid #667eea;
}

.hint-text {
  display: block;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
  font-size: 28rpx;
}

.hint-account {
  display: block;
  color: #666;
  font-size: 24rpx;
  margin-bottom: 5rpx;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  height: 100rpx;
  border-radius: 12rpx;
  font-size: 36rpx;
  
  &[disabled] {
    opacity: 0.6;
  }
}

.extra-options {
  display: flex;
  justify-content: space-between;
  padding: 0 10rpx;
}

.register-text, .forgot-text {
  color: #667eea;
  font-size: 28rpx;
  
  &:active {
    opacity: 0.7;
  }
}
</style>