# 幾何生成式設計工具 PRD (Geometric Generative Design Tool PRD)

## 1. 產品概述 (Product Overview)
本產品為基於 React 與 Tailwind CSS 開發的生成式設計應用程式，專注於透過幾何規則、數學序列與圖像遮罩生成向量圖形。
This product is a generative design application built with React and Tailwind CSS, focusing on creating vector graphics through geometric rules, mathematical sequences, and image masking.

---

## 2. 功能詳解與組件對應 (Detailed Features & Component Mapping)

### 2.1 核心畫布與渲染 (Core Canvas & Rendering)
*   **功能 (Feature)**: 負責將當前設計狀態 (State) 渲染為視覺圖像。支援縮放 (Zoom)、平移 (Pan) 與響應式重繪。
*   **組件 (Component)**: `/components/CanvasArea.tsx`
*   **邏輯 (Logic)**:
    *   `CanvasArea`: 管理 Canvas DOM 與繪圖 Context (2D)。
    *   `render()`: 主渲染循環，遍歷 Grid 計算每個單元 (Unit) 的屬性。
    *   `/lib/generatorUtils.ts`: 包含核心數學計算 (`calculateProps`, `getGradientColor`, `lerp`)。

### 2.2 單元與變形控制 (Unit & Transform Controls)
*   **功能 (Feature)**: 設定基本圖形形狀、線條樣式、圓角以及全域變形參數 (縮放、旋轉)。支援自定義 SVG 形狀，並具備自動邊界框計算 (Auto-Bounding Box) 以實現自動縮放與置中。
*   **狀態 (State)**: `state.unit`, `state.transform`
*   **組件 (Component)**: `/components/FloatingControls.tsx` (Top-Left Popover)
*   **JSX/JS 實作**:
    *   **Shape Selection**: `Select` (Rect, Circle, Triangle, Custom SVG).
    *   **Custom SVG**: 支援上傳或貼上 SVG 代碼/路徑數據。系統自動解析並計算 Bounding Box，確保圖形完美適應網格單元。
    *   **Stroke/Radius**: `FigmaSlider` 綁定 `strokeWidth`, `borderRadius`.
    *   **Rotation**: `FigmaSlider` 綁定 `transform.rotation`.
    *   **Scale**: 獨立 X/Y 軸控制，支援連結 (Link) 鎖定比例。

### 2.3 網格系統 (Grid System)
*   **功能 (Feature)**: 定義生成矩陣的排列方式、間距與單元尺寸。
*   **狀態 (State)**: `state.grid`
*   **組件 (Component)**: `/components/FloatingControls.tsx` (Top-Right Popover)
*   **JSX/JS 實作**:
    *   **Columns/Rows**: `input[type="number"]` 控制網格數量。
    *   **Spacing X/Y**: `Slider` 控制間距。
    *   **Unit Width/Height**: `Slider` 控制單元基礎尺寸。
    *   **Preview**: `Switch` 切換網格線顯示。

### 2.4 色彩系統 (Color System)
*   **功能 (Feature)**: 管理背景色與圖形漸層 (Gradient)。支援多色標 (Stops) 編輯。
*   **狀態 (State)**: `state.colors`
*   **組件 (Component)**: `/components/Sidebar.tsx` (Panel: "Colors")
*   **JSX/JS 實作**:
    *   **Gradient Editor**: 自定義色彩條，支援點擊新增 Stop，拖元移動位置。
    *   **Type**: `Select` (Linear/Radial).
    *   **Angle**: `FigmaSlider`.

### 2.5 序列系統 (Sequence System)
*   **功能 (Feature)**: 依據數學數列 (線性, 幾何, 費波那契) 動態改變圖形屬性。
*   **狀態 (State)**: `state.sequence`
*   **組件 (Component)**: `/components/Sidebar.tsx` (Panel: "Sequence System")
*   **JSX/JS 實作**:
    *   **Type**: `Select` (Linear, Geometric, Fibonacci).
    *   **Direction**: `Select` (Row, Column, Diagonal, Radial).
    *   **Step**: `FigmaSlider` 控制變化幅度。

### 2.6 圖像遮罩 / Map Modifier (Image Mask)
*   **功能 (Feature)**: 上傳圖片，依據像素亮度 (Luminance) 影響圖形的屬性。
*   **狀態 (State)**: `state.mask`
*   **組件 (Component)**: `/components/Sidebar.tsx` (Panel: "Image Mask")
*   **更新重點**:
    *   **絕對尺寸控制**: Scale X/Y (Width/Height) 控制單位已改為 **Pixel (px)**，解除 Unit Shape 大小與 Grid 基礎尺寸的綁定。
    *   **局部座標**: Position X/Y 改為局部座標系統。
*   **JSX/JS 實作**:
    *   **Upload**: `input[type="file"]` + `URL.createObjectURL`.
    *   **Influence Settings**: 透過 Checkbox 與 Slider 啟用並設定各屬性 (Width, Height, Opacity, Rotation, Radius, Color) 的影響範圍 (Min/Max)。
    *   **Logic**: `generatorUtils.ts` 中的 `calculateProps` 負責採樣像素並計算 `Mod` 值。

### 2.7 空間特效 (Spatial Effects / Distortion)
*   **功能 (Feature)**: 套用全域扭曲效果 (波浪, 漩渦)。
*   **狀態 (State)**: `state.distortion`
*   **組件 (Component)**: `/components/Sidebar.tsx` (Panel: "Spatial Effects")
*   **JSX/JS 實作**:
    *   **Wave**: `FigmaSlider` (Amount, Frequency).
    *   **Vortex**: `FigmaSlider` (Amount, Radius).

### 2.8 輸入與輸出 (Input/Output)
*   **功能 (Feature)**: 匯入 SVG 形狀、匯出 PNG/SVG、剪貼簿支援。
*   **組件 (Component)**: `/components/FloatingControls.tsx` (Bottom-Right)
*   **JSX/JS 實作**:
    *   **Export PNG**: `canvas.toDataURL`.
    *   **Export SVG**: `generatorUtils.generateSVG` (將狀態轉換為 SVG 字串).
    *   **Clipboard**: `navigator.clipboard.writeText`.
    *   **Paste**: 全域 `paste` 事件監聽，解析 `<svg>`, `d="..."` 或 `M...` 路徑並設為 Custom Unit。

### 2.9 預設系統 (Preset System)
*   **功能 (Feature)**: 儲存與載入設計狀態，並自動生成縮圖。
*   **狀態 (State)**: `state.presets`
*   **組件 (Component)**: `/components/Sidebar.tsx` (Panel: "AI & Presets")
*   **JSX/JS 實作**:
    *   **Save**: 將當前 `GeneratorState` 序列化並儲存，同時截取 Canvas 為 DataURL 作為縮圖。
    *   **Load**: 點擊縮圖恢復狀態。
    *   **Delete**: 刪除預設。

---

## 3. 待更新與修正項目 (To Be Updated & Revised)

以下功能目前存在於狀態 (State) 定義中，但在 UI 中缺失或需重構：

1.  **陰影與模糊特效 (Shadow & Blur)**:
    *   **現狀**: `state.effects` (Blur, Shadow) 存在。
    *   **缺失**: UI 面板 (Sidebar 的 "Effects" 僅包含 Distortion)，且 `CanvasArea` 渲染邏輯目前未實作 Shadow/Blur。
    *   **計劃**: 決定是否移除或重新實作。若實作，需更新 `render()` 邏輯使用 `ctx.shadowColor`, `ctx.filter` 等。

2.  **轉場系統 (Transition System)**:
    *   **現狀**: `state.transition` 存在。
    *   **缺失**: 完全無 UI 對應。
    *   **計劃**: 評估是否保留。

3.  **歷史紀錄 (Undo/Redo)**:
    *   **現狀**: `GeneratorContext` 實作了 Undo/Redo Reducer。
    *   **缺失**: UI 無觸發按鈕或快捷鍵監聽。
    *   **計劃**: 在 UI (可能在 Floating Controls 或頂部) 增加 Undo/Redo 按鈕或綁定 `Cmd+Z`。

---

## 4. AI 功能 (AI Features)

### 4.1 AI Variation (智慧變異)
*   **功能**: 基於當前設計風格，隨機微調 Transform (旋轉, 縮放, 傾斜), Distortion 與 Grid Spacing 參數，產生「延伸風格」的變體。
*   **組件**: `/components/Sidebar.tsx` -> AI & Presets Panel -> "Generate Variation" 按鈕。
*   **邏輯**: 使用 `Math.random()` 結合權重範圍，對現有參數進行 `delta` 偏移，而非完全隨機重置。

### 4.2 Image to Image (影像轉設計)
*   **功能**: 使用者上傳圖片，系統自動將其轉換為幾何半色調 (Halftone) 設計。
*   **組件**: `/components/Sidebar.tsx` -> AI & Presets Panel -> "Image to Image".
*   **邏輯**:
    1.  **色彩提取**: 分析圖片像素，提取主要色彩並建立 Gradient Stops。
    2.  **影像映射**: 將圖片設為 Mask Image。
    3.  **網格配置**: 自動設定高密度 Grid (40x40) 與圓形 Unit，利用 Mask 的 Width/Opacity Modifier 模擬半色調效果。

### 4.3 Prompt to Pattern (未來規劃)
*   **目標**: 串接 LLM/Vision API，根據使用者文字描述 (Prompt) 生成 `GeneratorState` 配置。
*   **現狀**: UI 已保留輸入框與按鈕 (Disabled)。

---

## 5. 設計系統規範 (Design System & Styling)
*   所有 UI 生成必須嚴格遵守 `/styles/globals.css` 定義的 CSS 變數 (Colors, Radius, Spacing)。
*   字體 (Typography) 僅使用 CSS 中定義的 Font Faces。
*   Tailwind CSS 類別需優先使用語意化變數 (如 `bg-[var(--card)]`) 而非硬編碼數值。
