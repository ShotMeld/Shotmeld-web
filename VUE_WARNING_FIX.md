# Vue 警告修复说明

## 问题描述
在使用 `ChangeCoverModal` 组件时出现了以下 Vue 警告：

```
[Vue warn]: Extraneous non-props attributes (class) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.
```

## 问题原因
这个警告是由于 `SfModal` 组件使用了 `<teleport to="body">` 导致的。Teleport 组件无法自动继承非 props 属性（如 `class`），因为：

1. **Teleport 特性**：Teleport 会将内容传送到指定的 DOM 节点（在这里是 `body`）
2. **属性继承限制**：由于内容被传送到了不同的 DOM 位置，Vue 无法正常处理属性继承
3. **Fragment 根节点**：组件可能有多个根节点，这也会阻止自动属性继承

## 解决方案
移除了以下两个组件中的 `class` 属性：

### 1. ChangeCoverModal.vue
```vue
<!-- 修复前 -->
<SfModal
  v-model="visible"
  :title="$t('changeCover.title')"
  size="default"
  class="change-cover-modal"  <!-- 移除这一行 -->
>

<!-- 修复后 -->
<SfModal
  v-model="visible"
  :title="$t('changeCover.title')"
  size="default"
>
```

### 2. AddPhotosModal.vue
```vue
<!-- 修复前 -->
<SfModal
  v-model="visible"
  :title="$t('addPhotosModal.title')"
  size="default"
  class="add-photos-modal"  <!-- 移除这一行 -->
>

<!-- 修复后 -->
<SfModal
  v-model="visible"
  :title="$t('addPhotosModal.title')"
  size="default"
>
```

## 最佳实践
1. **避免向 Teleport 组件传递 class**：由于 Teleport 的特殊性，外部的 class 不会生效
2. **使用 scoped CSS**：在组件内部使用 scoped 样式来控制外观
3. **通过 props 传递样式控制**：如果需要动态样式，通过 props 传递给组件内部处理

## 验证结果
- ✅ 警告消除
- ✅ 功能正常
- ✅ 样式保持一致
- ✅ 组件行为未受影响

修复完成后，两个模态框组件都能正常工作，且不再产生 Vue 警告。
