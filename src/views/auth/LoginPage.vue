<!--
  LoginPage.vue - 登录页
-->

<template>
  <div class="page-container">
    <div class="login-card">
      <h1 class="brand-title">ShotMeld</h1>
      <h2 class="login-title">登录</h2>
      <form @submit.prevent="handleLogin">
        <SfInput v-model="formData.emailOrUsername" label="用户名或邮箱地址" required :error="errors.emailOrUsername">
          <template #prefix>
            <i class="sf-icon">@</i>
          </template>
        </SfInput>

        <SfInput 
          v-model="formData.password" 
          label="密码" 
          type="password" 
          required 
          :error="errors.password"
          @keyup.enter="handleLogin" 
        >
          <template #prefix>
            <i class="sf-icon">🔒</i>
          </template>
        </SfInput>

        <SfButton type="primary" rounded full-width :loading="loading" class="login-button" @click="handleLogin">
          {{ loading ? '登录中...' : '登录' }}
        </SfButton>

        <div class="additional-links">
          <router-link to="/register" class="text-link">没有账号？立即注册</router-link>
        </div>
        
        <!-- ICP备案信息 -->
        <IcpFooter />
      </form>
    </div>
  </div>
</template>
<script>
import { authService } from '../../api';
import IcpFooter from '../../layout/IcpFooter.vue';

export default {
  name: 'LoginPage',
  components: {
    IcpFooter
  },
  data() {
    return {
      formData: {
        emailOrUsername: '',
        password: ''
      },
      errors: {
        emailOrUsername: '',
        password: ''
      },
      loading: false
    }
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors = {
        emailOrUsername: '',
        password: ''
      };

      if (!this.formData.emailOrUsername) {
        this.errors.emailOrUsername = '请输入用户名或邮箱地址';
        isValid = false;
      }

      if (!this.formData.password) {
        this.errors.password = '请输入密码';
        isValid = false;
      }

      return isValid;
    },
    async handleLogin() {
      try {
        if (!this.validateForm()) return;

        this.loading = true;

        const response = await authService.login({
          emailOrUsername: this.formData.emailOrUsername,
          password: this.formData.password
        });

        const { token, user } = response.data;

        // 保存认证信息
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // 确保路由跳转前完成状态更新
        await this.$nextTick();

        // 跳转到照片墙页面
        this.$router.push({ path: '/photowall', replace: true });

      } catch (error) {
        let errorMessage = '登录失败，请重试';
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;

          // 处理特定错误
          if (error.response.status === 401) {
            this.errors.password = '用户名或密码错误';
          } else {
            this.errors.emailOrUsername = errorMessage;
          }
        } else {
          this.errors.emailOrUsername = errorMessage;
        }
        console.error('登录失败:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--spacing-md);
  background-image: url('https://www.loliapi.com/acg/');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.page-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.login-card {
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-large);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-large);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  animation: card-appear 0.5s var(--transition-bounce);
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-extra-large);
}

.brand-title {
  color: var(--text-primary);
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-md);
  font-weight: 400;
  text-align: center;
  font-family: "Dancing Script", cursive;
}

.login-title {
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-xl);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

.login-button {
  margin-top: var(--spacing-lg);
}

.sf-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
}

.additional-links {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.text-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.text-link:hover {
  color: rgba(0, 122, 255, 0.8);
}

@keyframes card-appear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--spacing-xl);
    margin: 0 var(--spacing-md);
  }

  .login-title {
    font-size: var(--font-size-xl);
  }
}
</style>