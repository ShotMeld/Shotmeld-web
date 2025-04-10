<template>
  <div class="register-container">
    <div class="register-box">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <input type="text" v-model="username" placeholder="用户名" required>
        </div>
        <div class="form-group">
          <input type="password" v-model="password" placeholder="密码" required>
        </div>
        <div class="form-group">
          <input type="password" v-model="confirmPassword" placeholder="确认密码" required>
        </div>
        <button type="submit" class="register-btn">注册</button>
      </form>
      <div class="extra-links">
        <router-link to="/login">已有账号？立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    handleRegister() {
      if (this.password !== this.confirmPassword) {
        alert('两次输入的密码不一致！');
        return;
      }
      // 这里添加注册逻辑
      console.log('注册信息：', this.username, this.password);
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #42b983;
  outline: none;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.register-btn:hover {
  background-color: #3aa876;
}

.extra-links {
  margin-top: 20px;
}

.extra-links a {
  color: #42b983;
  text-decoration: none;
}

.extra-links a:hover {
  text-decoration: underline;
}
</style>