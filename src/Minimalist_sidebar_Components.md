# Components 功能說明文檔

本文檔詳細說明了項目中所有組件的功能、用途和使用方式。

---

## 目錄

1. [自定義組件](#自定義組件)
2. [UI 組件庫 (ShadCN)](#ui-組件庫-shadcn)
3. [系統組件](#系統組件)

---

## 自定義組件

### SidebarDemo.tsx

**位置**: `/components/SidebarDemo.tsx`

**主要功能**: 提供一個功能完整、可折疊的側邊欄導航系統。

#### 核心組件

##### Frame760
- **描述**: 側邊欄的主容器組件
- **功能**: 
  - 提供完整的側邊欄布局框架
  - 支持折疊/展開動畫效果
  - 整合所有子組件

##### InterfacesLogo1
- **描述**: 自定義 Logo 組件
- **功能**:
  - 顯示應用程序的品牌標識
  - 使用 SVG 路徑繪製 Logo
  - 支持響應式尺寸調整

##### Avatar
- **描述**: 用戶頭像組件
- **功能**:
  - 顯示用戶圖標
  - 圓形頭像設計
  - 帶有邊框裝飾效果

##### SearchContainer
- **描述**: 搜索輸入容器
- **Props**:
  - `isCollapsed`: boolean (可選) - 控制搜索框是否處於折疊狀態
- **功能**:
  - 搜索任務和項目
  - 支持平滑的展開/折疊動畫
  - 折疊時只顯示搜索圖標
  - 展開時顯示完整的搜索輸入框

##### MenuItem
- **描述**: 側邊欄菜單項組件
- **Props**:
  - `item`: MenuItem - 菜單項數據
  - `isExpanded`: boolean (可選) - 是否展開子菜單
  - `onToggle`: function (可選) - 切換展開狀態的回調
  - `onItemClick`: function (可選) - 點擊菜單項的回調
  - `isCollapsed`: boolean (可選) - 側邊欄是否折疊
- **功能**:
  - 渲染單個菜單項
  - 支持圖標和標籤
  - 支持下拉箭頭指示器
  - 懸停和激活狀態效果
  - 響應折疊狀態的動畫

##### SubMenuItem
- **描述**: 子菜單項組件
- **Props**:
  - `item`: MenuItem - 子菜單項數據
  - `onItemClick`: function (可選) - 點擊回調
- **功能**:
  - 渲染嵌套的子菜單項
  - 帶有縮進效果
  - 懸停狀態效果

##### MenuSection
- **描述**: 菜單分組組件
- **Props**:
  - `section`: MenuSection - 分組數據
  - `expandedItems`: Set<string> - 已展開項目的集合
  - `onToggleExpanded`: function - 切換展開狀態的回調
  - `isCollapsed`: boolean (可選) - 側邊欄是否折疊
- **功能**:
  - 渲染一組相關的菜單項
  - 顯示分組標題
  - 管理多個菜單項和子菜單項

#### 數據結構

##### MenuItem Interface
```typescript
interface MenuItem {
  icon: React.ReactNode;      // 菜單項圖標
  label: string;              // 菜單項標籤
  hasDropdown?: boolean;      // 是否有下拉子菜單
  isActive?: boolean;         // 是否為激活狀態
  children?: MenuItem[];      // 子菜單項數組
}
```

##### MenuSection Interface
```typescript
interface MenuSection {
  title: string;              // 分組標題
  items: MenuItem[];          // 菜單項數組
}
```

##### SidebarContent Interface
```typescript
interface SidebarContent {
  title: string;              // 側邊欄標題
  sections: MenuSection[];    // 分組數組
}
```

#### 功能特性

1. **多模式導航**:
   - Dashboard (儀表板)
   - Tasks (任務)
   - Projects (項目)
   - Calendar (日曆)
   - Teams (團隊)
   - Analytics (分析)
   - Files (文件)

2. **動畫效果**:
   - 使用自定義彈簧曲線 `cubic-bezier(0.25, 1.1, 0.4, 1)`
   - 平滑的展開/折疊過渡
   - 圖標旋轉動畫

3. **響應式設計**:
   - 支持完整展開和折疊兩種狀態
   - 折疊時顯示圖標提示
   - 展開時顯示完整內容

4. **互動功能**:
   - 可展開/折疊的菜單項
   - 點擊反饋
   - 懸停效果
   - 多級菜單支持

---

## UI 組件庫 (ShadCN)

項目集成了完整的 ShadCN UI 組件庫，所有組件位於 `/components/ui/` 目錄。

### 輸入組件

#### button.tsx
- **功能**: 可自定義樣式的按鈕組件
- **用途**: 表單提交、操作觸發、導航等
- **變體**: 支持多種樣式變體（primary、secondary、ghost 等）

#### input.tsx
- **功能**: 文本輸入框
- **用途**: 表單數據輸入
- **特性**: 支持各種輸入類型和驗證

#### textarea.tsx
- **功能**: 多行文本輸入區域
- **用途**: 長文本內容輸入（評論、描述等）

#### checkbox.tsx
- **功能**: 複選框控件
- **用途**: 多選項選擇
- **特性**: 支持受控和非受控模式

#### radio-group.tsx
- **功能**: 單選按鈕組
- **用途**: 單選項選擇
- **特性**: 支持鍵盤導航

#### select.tsx
- **功能**: 下拉選擇器
- **用途**: 從列表中選擇一個選項
- **特性**: 支持搜索和自定義渲染

#### slider.tsx
- **功能**: 滑塊控件
- **用途**: 範圍值選擇
- **特性**: 支持最小值、最大值和步進

#### switch.tsx
- **功能**: 開關切換
- **用途**: 二態切換（開/關）

#### input-otp.tsx
- **功能**: 一次性密碼輸入
- **用途**: 驗證碼輸入
- **特性**: 支持複製粘貼功能

### 反饋組件

#### alert.tsx
- **功能**: 警告/通知消息
- **用途**: 顯示重要信息或狀態
- **變體**: success、warning、error、info

#### alert-dialog.tsx
- **功能**: 模態警告對話框
- **用途**: 需要用戶確認的操作
- **特性**: 阻止背景交互

#### dialog.tsx
- **功能**: 通用對話框/模態窗口
- **用途**: 顯示額外內容或表單
- **特性**: 支持自定義內容和動畫

#### toast (sonner.tsx)
- **功能**: 短暫的通知消息
- **用途**: 操作反饋（成功、失敗等）
- **特性**: 自動消失、支持堆疊

#### progress.tsx
- **功能**: 進度條
- **用途**: 顯示任務完成進度
- **特性**: 支持不確定狀態

#### skeleton.tsx
- **功能**: 骨架屏佔位符
- **用途**: 加載狀態顯示
- **特性**: 提升用戶體驗

#### tooltip.tsx
- **功能**: 工具提示
- **用途**: 懸停時顯示額外信息
- **特性**: 智能定位

### 導航組件

#### navigation-menu.tsx
- **功能**: 導航菜單
- **用途**: 網站主導航
- **特性**: 支持多級菜單和下拉

#### menubar.tsx
- **功能**: 菜單欄
- **用途**: 桌面應用風格的菜單
- **特性**: 鍵盤快捷鍵支持

#### breadcrumb.tsx
- **功能**: 麵包屑導航
- **用途**: 顯示頁面層級路徑
- **特性**: 支持自定義分隔符

#### pagination.tsx
- **功能**: 分頁控件
- **用途**: 大量數據的分頁導航
- **特性**: 支持頁碼跳轉

#### tabs.tsx
- **功能**: 標籤頁
- **用途**: 內容分組切換
- **特性**: 支持鍵盤導航

#### sidebar.tsx
- **功能**: 側邊欄框架
- **用途**: 應用程序側邊欄布局
- **特性**: 可折疊、主題化

### 展示組件

#### card.tsx
- **功能**: 卡片容器
- **用途**: 內容分組和展示
- **組成**: Header、Content、Footer

#### avatar.tsx
- **功能**: 頭像組件
- **用途**: 用戶頭像展示
- **特性**: 支持圖片和文字回退

#### badge.tsx
- **功能**: 徽章標籤
- **用途**: 狀態標識、計數器
- **變體**: 多種顏色和樣式

#### table.tsx
- **功能**: 數據表格
- **用途**: 結構化數據展示
- **特性**: 響應式設計

#### calendar.tsx
- **功能**: 日曆選擇器
- **用途**: 日期選擇
- **特性**: 支持日期範圍選擇

#### chart.tsx
- **功能**: 圖表組件
- **用途**: 數據可視化
- **基礎**: 基於 Recharts 構建

#### carousel.tsx
- **功能**: 輪播圖
- **用途**: 圖片或內容輪播
- **基礎**: 基於 Embla Carousel

### 交互組件

#### dropdown-menu.tsx
- **功能**: 下拉菜單
- **用途**: 操作菜單展示
- **特性**: 支持子菜單和分隔符

#### context-menu.tsx
- **功能**: 右鍵上下文菜單
- **用途**: 右鍵操作菜單
- **特性**: 支持多級菜單

#### popover.tsx
- **功能**: 彈出框
- **用途**: 顯示額外內容
- **特性**: 智能定位

#### hover-card.tsx
- **功能**: 懸停卡片
- **用途**: 預覽內容
- **特性**: 延遲顯示

#### command.tsx
- **功能**: 命令面板
- **用途**: 快速命令和搜索
- **特性**: 鍵盤導航、模糊搜索

#### sheet.tsx
- **功能**: 抽屜/側滑面板
- **用途**: 從側邊滑入的內容
- **特性**: 支持四個方向

#### drawer.tsx
- **功能**: 底部抽屜
- **用途**: 移動端友好的面板
- **特性**: 支持拖拽關閉

### 布局組件

#### accordion.tsx
- **功能**: 手風琴折疊面板
- **用途**: 內容折疊展開
- **特性**: 支持單個或多個展開

#### collapsible.tsx
- **功能**: 可折疊容器
- **用途**: 簡單的內容折疊
- **特性**: 動畫過渡

#### separator.tsx
- **功能**: 分隔線
- **用途**: 視覺分隔內容
- **方向**: 水平或垂直

#### scroll-area.tsx
- **功能**: 自定義滾動區域
- **用途**: 美化的滾動條
- **特性**: 跨瀏覽器一致性

#### resizable.tsx
- **功能**: 可調整大小的面板
- **用途**: 分割視圖布局
- **特性**: 鍵盤支持

#### aspect-ratio.tsx
- **功能**: 縱橫比容器
- **用途**: 保持內容比例
- **用例**: 圖片、視頻顯示

### 表單組件

#### form.tsx
- **功能**: 表單構建工具
- **用途**: 表單驗證和狀態管理
- **集成**: React Hook Form + Zod

#### label.tsx
- **功能**: 表單標籤
- **用途**: 輸入框標籤
- **特性**: 無障礙訪問

#### toggle.tsx
- **功能**: 切換按鈕
- **用途**: 二態切換
- **變體**: 多種樣式

#### toggle-group.tsx
- **功能**: 切換按鈕組
- **用途**: 多個切換選項
- **模式**: 單選或多選

---

## 系統組件

### ImageWithFallback.tsx

**位置**: `/components/figma/ImageWithFallback.tsx`

**功能**: 帶有回退機制的圖片組件

**特性**:
- 圖片加載失敗時自動顯示占位符
- 提升用戶體驗
- 與標準 `<img>` 標籤 API 兼容

**使用方式**:
```tsx
import { ImageWithFallback } from './components/figma/ImageWithFallback';

<ImageWithFallback 
  src="image-url.jpg" 
  alt="描述" 
  className="樣式類"
/>
```

**注意**: 這是受保護的系統文件，不應被修改。

---

## 使用指南

### 導入組件

#### ShadCN UI 組件
```tsx
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import { Card } from "./components/ui/card";
```

#### 自定義組件
```tsx
import { Frame760 } from "./components/SidebarDemo";
```

#### 系統組件
```tsx
import { ImageWithFallback } from './components/figma/ImageWithFallback';
```

### 最佳實踐

1. **組件組合**: 優先使用小型、可組合的組件構建複雜 UI
2. **類型安全**: 充分利用 TypeScript 類型檢查
3. **響應式設計**: 使用 Tailwind CSS 實現響應式布局
4. **無障礙訪問**: 所有組件均內置無障礙支持
5. **性能優化**: 使用 React.memo 和 useMemo 優化渲染
6. **狀態管理**: 使用 useState 和 useReducer 管理組件狀態

### 樣式自定義

所有組件使用 Tailwind CSS 進行樣式設置，全局樣式配置位於 `/styles/globals.css`。

**注意**: 
- 不要覆蓋預設的字體大小、字重和行高，除非特別需要
- 使用 CSS 變量進行主題自定義
- 遵循項目的設計系統

---

## 擴展和自定義

### 創建新組件

1. 在 `/components` 目錄創建新的 `.tsx` 文件
2. 使用 TypeScript 定義組件接口
3. 使用 Tailwind CSS 進行樣式設置
4. 導出組件供其他文件使用

### 修改 UI 組件

**警告**: `/components/ui` 目錄僅用於 ShadCN 組件。如需自定義，建議：
- 創建包裝組件而不是直接修改
- 使用組件的 props 自定義行為
- 通過 className 添加額外樣式

---

## 技術棧

- **React**: 組件框架
- **TypeScript**: 類型安全
- **Tailwind CSS**: 樣式系統
- **ShadCN/ui**: UI 組件庫
- **Radix UI**: 無障礙原語
- **Carbon Icons**: 圖標庫
- **Lucide React**: 圖標庫（備選）

---

## 維護說明

### 組件更新
- 定期檢查 ShadCN 組件更新
- 保持依賴項最新
- 測試組件在不同屏幕尺寸下的表現

### 文檔維護
- 添加新組件時更新此文檔
- 記錄重大變更
- 提供使用示例

---

## 相關資源

- [ShadCN/ui 官方文檔](https://ui.shadcn.com/)
- [Radix UI 文檔](https://www.radix-ui.com/)
- [Tailwind CSS 文檔](https://tailwindcss.com/)
- [React 官方文檔](https://react.dev/)

---

**最後更新**: 2025-11-16
