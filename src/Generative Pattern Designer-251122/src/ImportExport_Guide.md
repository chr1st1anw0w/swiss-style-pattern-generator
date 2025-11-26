# Figma Make: Import & Export Module Guide

**Version**: 1.0  
**Date**: 2025-11-22  
**Target**: Reusable Pattern for Figma Make Projects  

---

## 1. Module Overview

This module provides a standardized way to handle data ingress (Import) and egress (Export) for generative design tools. It is designed to be loosely coupled with the main application logic, making it highly portable to other Figma Make projects.

### Key Features
*   **Figma-Native Workflow**: "Copy as SVG" from Figma -> "Paste" in App.
*   **Vector Precision**: Exports clean, editable SVGs (not just raster screenshots).
*   **Universal Compatibility**: Standard PNG export for quick sharing.
*   **Design System Compliant**: Fully styled using CSS variables defined in `globals.css`.

---

## 2. Import System (Data Ingress)

The import system allows users to bring external vector shapes into the generative engine.

### 2.1 UI Layout & Components

**Location**: Typically placed in the **Control Panel** (Sidebar) or a dedicated **Toolbar**.

#### UI Structure
```text
[ Container: Flex Row / Grid (Gap: 2) ]
   |
   ├─ [ Hidden Input type="file" accept=".svg" ]
   |
   ├─ [ Button: Upload ] (Variant: Outline)
   |     Icon: Upload (Lucide)
   |     Label: "Upload"
   |     Trigger: Simulates click on hidden input
   |
   └─ [ Button: Paste ] (Variant: Outline)
         Icon: Clipboard (Lucide)
         Label: "Paste"
         Trigger: Reads navigator.clipboard
```

#### Component Design Specs
*   **Container Style**: 
    *   Background: `var(--color-muted)`
    *   Padding: `p-2`
    *   Radius: `var(--radius)` (derived from globals.css)
*   **Buttons**:
    *   Height: `h-9` (Compact)
    *   Font: `var(--font-sans)`
    *   Background: `var(--color-background)`
    *   Border: `1px solid var(--color-border)`
    *   Hover State: Opacity 90% or slight background tint.

### 2.2 Logic Implementation

#### Custom SVG Upload
*   **Mechanism**: Uses `FileReader` API to read text content from `.svg` files.
*   **Validation**: Checks for `<svg>` tags within the content.
*   **Storage**: Stores the raw SVG string in the app state (`config.customSVG`).

#### Clipboard Paste (Figma Integration)
*   **Mechanism**: `navigator.clipboard.readText()`
*   **User Flow**:
    1.  User selects vector in Figma.
    2.  User Right Clicks -> "Copy as SVG".
    3.  User clicks "Paste" in the app.
*   **Error Handling**: If clipboard permission is denied, opens a **Fallback Dialog**.

#### Fallback Dialog (SVGInputDialog)
If browser security blocks clipboard access, a modal appears:
*   **Component**: `Dialog` (shadcn/ui)
*   **Body**: `Textarea` (min-height: 200px) for manual pasting.
*   **Footer**: "Import" button (Primary color).

---

## 3. Export System (Data Egress)

The export system handles converting the rendered canvas or internal state into downloadable files.

### 3.1 UI Layout & Components

**Location**: Usually a primary action group at the bottom of the Control Panel.

#### UI Structure
```text
[ Container: Flex Column (Space-y-2) ]
   |
   ├─ [ Button Group: Grid Cols-2 ]
   |     ├─ [ Button: Export ] (Variant: Outline)
   |     |     Icon: Download
   |     |     Action: Opens Export Modal
   |     |
   |     └─ [ Button: To Figma ] (Variant: Outline)
   |           Icon: Copy
   |           Action: Direct Clipboard Write
```

### 3.2 Export Dialog (Modal)

A centralized hub for export options.

#### UI Composition
*   **Header**: Title "Export Pattern" (`text-lg font-semibold`).
*   **Preview Area**:
    *   Background: Checkerboard pattern (to show transparency).
    *   Content: Live preview of the generated pattern.
*   **Action Grid**:
    *   **PNG Export**: High-res raster download.
    *   **SVG Export**: Vector file download.
    *   **Copy SVG**: Copy code to clipboard.

#### Component Styling (Design System)
*   **Dialog Overlay**: `backdrop-blur-sm bg-black/30`
*   **Dialog Content**: 
    *   Background: `var(--color-background)`
    *   Border: `var(--color-border)`
    *   Radius: `var(--radius-card)`
*   **Typography**: All text uses `var(--font-sans)`.

### 3.3 Logic Implementation

#### PNG Export (`exportUtils.ts`)
*   **Source**: HTML5 Canvas Element (`.toDataURL()`).
*   **Tricks**:
    *   Create a temporary link element (`<a>`).
    *   Set `download` attribute.
    *   Programmatically click and remove.

#### SVG Export (`generativeSVGExport.ts`)
*   **Concept**: Rebuild the DOM structure as a string. **Do not** just dump the canvas.
*   **Why?**: Canvas is raster pixels. SVG is vector paths.
*   **Process**:
    1.  Iterate through `elements` state array.
    2.  Map shapes (circle, square, custom path) to SVG strings: `<rect ... />`, `<path ... />`.
    3.  Wrap in `<svg width="..." height="..." xmlns="...">`.
    4.  Create Blob (`type: 'image/svg+xml'`) and download.

#### Copy to Figma (The "Magic" Button)
*   **Workflow**:
    1.  Generate the SVG string (same as above).
    2.  Use `navigator.clipboard.writeText(svgString)`.
    3.  **Toast Notification**: "Copied! Paste in Figma."
*   **Benefit**: Allows designers to iterate in the tool, then instantly transfer vector layers back to Figma for final touches.

---

## 4. Reusable Code Pattern

To implement this in another project, organize your utils as follows:

### 4.1 `svgHelpers.ts`
Pure functions to parse and validate SVG code.

```typescript
export const validateSVG = (code: string): boolean => {
  return code.includes('<svg') && code.includes('</svg>');
};

export const cleanSVG = (code: string): string => {
  // Remove width/height attributes to let it scale
  return code.replace(/width="[^"]*"/, '').replace(/height="[^"]*"/, '');
};
```

### 4.2 `exportHelpers.ts`
Pure functions to handle browser downloads.

```typescript
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

---

## 5. Design System Integration Checklist

When porting these components, ensure the following CSS variables are defined in the target project's `globals.css`:

| Variable | Purpose | Example Value |
| :--- | :--- | :--- |
| `--color-background` | Panel backgrounds | `#FFFFFF` |
| `--color-foreground` | Primary text color | `#0F172B` |
| `--color-primary` | Main action buttons | `#00C16A` |
| `--color-border` | Borders for inputs/panels | `#CAD5E2` |
| `--color-muted` | Secondary backgrounds | `#F0F0F0` |
| `--radius` | Component corner radius | `6px` |
| `--font-sans` | Main application font | `"DM Sans", sans-serif` |

---

**Note for Developers**: This module relies on `lucide-react` for icons and `sonner` for toast notifications. Ensure these dependencies are installed.
