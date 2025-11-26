import React from 'react';
import { GeneratorProvider } from './components/context/GeneratorContext';
import { Sidebar } from './components/Sidebar';
import { CanvasArea } from './components/CanvasArea';
import { FloatingControls } from './components/FloatingControls';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './components/ui/sheet'; 
import { MdMenu } from 'react-icons/md';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { LayerPanel } from './components/LayerPanel';

function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Left Panel: Layers */}
      <div className="hidden md:flex h-full shrink-0 flex-col bg-muted w-[250px] border-r border-[var(--border)]">
        <LayerPanel className="h-full" />
      </div>

      {/* Mobile Sidebar Trigger & Sheet */}
      <div className="md:hidden absolute top-4 left-4 z-30">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-[var(--card)] border-[var(--border)]">
              <MdMenu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[85vw] border-r border-[var(--border)] bg-[var(--panel)]">
             <SheetTitle className="hidden">Navigation</SheetTitle>
             <SheetDescription className="hidden">Sidebar configuration</SheetDescription>
             <Sidebar /> 
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
         <CanvasArea />
         <FloatingControls />
      </main>

      {/* Right Panel: Controls */}
      <div className="hidden md:flex h-full shrink-0 flex-col bg-muted w-[320px] border-l border-[var(--border)]">
        <Sidebar className="h-full" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <GeneratorProvider>
        <Layout />
      </GeneratorProvider>
    </DndProvider>
  );
}
