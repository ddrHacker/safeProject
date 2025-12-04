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
// 1. 引入 MD5 库 (如果没有使用npm，请修改为你的相对路径，如 '@/utils/md5.js')
import md5 from 'js-md5';

export default {
  data() {
    return {
      username: '',
      password: '',
      loading: false
    }
  },
  methods: {
    handleLogin() {
      // 1. 基础校验
      if (!this.username.trim()) {
        return uni.showToast({ title: '请输入用户名', icon: 'none' });
      }
      if (!this.password.trim()) {
        return uni.showToast({ title: '请输入密码', icon: 'none' });
      }

      this.loading = true;

      // 2. 密码加密 (通常后端会要求 md5 加密)
      // 有些后端可能要求加盐(salt)，例如: md5(this.password + 'my_salt')
      const encryptedPassword = md5(this.password);

      // 3. 发起请求
      uni.request({
        url: uni.$baseUrl+'/appv1/login/', // 替换为真实接口地址
        method: 'POST',
        data: {
          username: this.username,
          password: encryptedPassword
        },
        success: (res) => {
          // 假设后端返回格式: { code: 200, msg: "success", data: { token: "...", user: { ... } } }
          if (res.data.code === 200) {
            
            const loginData = res.data.data;
            
            // 4. 存储用户信息
            // (1) 存 Token (用于后续请求拦截器添加 Header)
            uni.setStorageSync('token', loginData.token);
            
            // (2) 存用户详细信息 (真实姓名、头像等)
            uni.setStorageSync('userInfo', loginData.user);
            
            // (3) ★存用户角色 (非常重要，用于之前的 TabBar 权限判断)
            // 假设后端返回的字段是 loginData.user.role (例如 'inspector' 或 'inspected')
            uni.setStorageSync('userRole', loginData.user.role);

            uni.showToast({ title: '登录成功', icon: 'success' });

            // 5. 延迟跳转
            setTimeout(() => {
              // ★ 关键点：如果 issue-list 是 TabBar 页面，必须用 switchTab
              // 如果它不是 TabBar 页面，请改用 uni.reLaunch
              uni.switchTab({
                url: '/pages/issue-list/issue-list',
                success: () => {
                  console.log('跳转成功');
                },
                fail: (err) => {
                  console.error('跳转失败，可能是因为该页面未在 pages.json 的 tabBar 中注册', err);
                  // 如果 switchTab 失败，尝试用 reLaunch
                  uni.reLaunch({ url: '/pages/issue-list/issue-list' });
                }
              });
            }, 1000);

          } else {
            // 登录失败逻辑
            uni.showToast({ 
              title: res.data.msg || '用户名或密码错误', 
              icon: 'none' 
            });
          }
        },
        fail: () => {
          uni.showToast({ title: '网络请求失败', icon: 'none' });
        },
        complete: () => {
          this.loading = false;
        }
      });
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