<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>LoadingSpinner 组件演示</h1>
      <p>统一的加载动画组件，支持多种配置和场景</p>
    </div>

    <div class="demo-sections">
      <!-- 基本用法 -->
      <section class="demo-section">
        <h2>基本用法</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>默认样式</h3>
            <div class="demo-box">
              <LoadingSpinner />
            </div>
          </div>

          <div class="demo-item">
            <h3>指定对象</h3>
            <div class="demo-box">
              <LoadingSpinner target="照片" />
            </div>
          </div>

          <div class="demo-item">
            <h3>自定义文本</h3>
            <div class="demo-box">
              <LoadingSpinner text="正在处理数据..." />
            </div>
          </div>
        </div>
      </section>

      <!-- 不同尺寸 -->
      <section class="demo-section">
        <h2>不同尺寸</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>小尺寸 (small)</h3>
            <div class="demo-box">
              <LoadingSpinner size="small" target="数据" />
            </div>
          </div>

          <div class="demo-item">
            <h3>中尺寸 (medium)</h3>
            <div class="demo-box">
              <LoadingSpinner size="medium" target="图片" />
            </div>
          </div>

          <div class="demo-item">
            <h3>大尺寸 (large)</h3>
            <div class="demo-box">
              <LoadingSpinner size="large" target="视频" />
            </div>
          </div>
        </div>
      </section>

      <!-- 不同内边距 -->
      <section class="demo-section">
        <h2>不同内边距</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>无内边距 (none)</h3>
            <div class="demo-box">
              <LoadingSpinner padding="none" target="内容" />
            </div>
          </div>

          <div class="demo-item">
            <h3>小内边距 (small)</h3>
            <div class="demo-box">
              <LoadingSpinner padding="small" target="内容" />
            </div>
          </div>

          <div class="demo-item">
            <h3>普通内边距 (normal)</h3>
            <div class="demo-box">
              <LoadingSpinner padding="normal" target="内容" />
            </div>
          </div>

          <div class="demo-item">
            <h3>大内边距 (large)</h3>
            <div class="demo-box">
              <LoadingSpinner padding="large" target="内容" />
            </div>
          </div>
        </div>
      </section>

      <!-- 特殊布局 -->
      <section class="demo-section">
        <h2>特殊布局</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>水平布局</h3>
            <div class="demo-box">
              <LoadingSpinner container-class="inline" text="处理中..." />
            </div>
          </div>

          <div class="demo-item">
            <h3>仅动画</h3>
            <div class="demo-box">
              <LoadingSpinner :show-text="false" />
            </div>
          </div>

          <div class="demo-item">
            <h3>深色主题</h3>
            <div class="demo-box dark-theme">
              <LoadingSpinner container-class="on-dark" target="数据" />
            </div>
          </div>
        </div>
      </section>

      <!-- 实际应用场景 -->
      <section class="demo-section">
        <h2>实际应用场景</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>页面加载</h3>
            <div class="demo-box page-loading">
              <LoadingSpinner target="页面内容" padding="large" />
            </div>
          </div>

          <div class="demo-item">
            <h3>图片加载</h3>
            <div class="demo-box image-loading">
              <div class="mock-image">
                <LoadingSpinner text="正在加载高清图..." size="medium" />
              </div>
            </div>
          </div>

          <div class="demo-item">
            <h3>上传进度</h3>
            <div class="demo-box upload-demo">
              <LoadingSpinner text="正在上传文件 (50%)" size="medium" />
            </div>
          </div>
        </div>
      </section>

      <!-- 常用对象类型 -->
      <section class="demo-section">
        <h2>常用对象类型演示</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <LoadingSpinner target="照片" />
          </div>
          <div class="demo-item">
            <LoadingSpinner target="相册" />
          </div>
          <div class="demo-item">
            <LoadingSpinner target="用户信息" />
          </div>
          <div class="demo-item">
            <LoadingSpinner target="时间线" />
          </div>
          <div class="demo-item">
            <LoadingSpinner target="编辑器" />
          </div>
          <div class="demo-item">
            <LoadingSpinner target="相册详情" />
          </div>
        </div>
      </section>
    </div>

    <!-- 使用说明 -->
    <div class="demo-footer">
      <h2>使用说明</h2>
      <div class="usage-code">
        <pre><code>&lt;!-- 基本用法 --&gt;
&lt;LoadingSpinner /&gt;

&lt;!-- 指定加载对象 --&gt;
&lt;LoadingSpinner target="照片" /&gt;

&lt;!-- 自定义文本 --&gt;
&lt;LoadingSpinner text="正在处理..." /&gt;

&lt;!-- 完整配置 --&gt;
&lt;LoadingSpinner 
  target="用户信息"
  size="large"
  padding="large"
  :show-text="true"
/&gt;</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'

export default {
  name: 'LoadingSpinnerDemo',
  components: {
    LoadingSpinner,
  },
}
</script>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  font-family: var(--font-family);
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.demo-header h1 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.demo-header p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.demo-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

.demo-section h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

.demo-item {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.demo-item h3 {
  padding: var(--spacing-md) var(--spacing-lg);
  margin: 0;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  border-bottom: 1px solid var(--border-color);
}

.demo-box {
  padding: var(--spacing-xl);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.demo-box.dark-theme {
  background: #1a1a1a;
  color: #ffffff;
}

.demo-box.page-loading {
  min-height: 200px;
  background: var(--bg-secondary);
}

.demo-box.image-loading {
  padding: 0;
}

.mock-image {
  width: 100%;
  height: 150px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.demo-box.upload-demo {
  background: var(--bg-tertiary);
  border: 2px dashed var(--border-color);
}

.demo-footer {
  margin-top: var(--spacing-4xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

.demo-footer h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.usage-code {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
}

.usage-code pre {
  margin: 0;
  overflow-x: auto;
}

.usage-code code {
  color: var(--text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .demo-page {
    padding: var(--spacing-lg);
  }

  .demo-grid {
    grid-template-columns: 1fr;
  }

  .demo-item h3 {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-xs);
  }

  .demo-box {
    padding: var(--spacing-lg);
    min-height: 100px;
  }
}
</style>
