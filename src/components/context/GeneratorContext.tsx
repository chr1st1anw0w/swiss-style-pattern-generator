import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";
import { v4 as uuidv4 } from "uuid";

// --- Types ---

export type ShapeType = "rect" | "circle" | "triangle" | "custom";
export type SequenceType =
  | "none"
  | "linear"
  | "geometric"
  | "fibonacci"
  | "power"
  | "custom";
export type SequenceDirection = "row" | "column" | "radial" | "diagonal";
export type CurveType =
  | "linear"
  | "quadratic"
  | "cubic"
  | "exponential"
  | "sine"
  | "logarithmic";

export interface GradientStop {
  id: string;
  color: string;
  position: number; // 0 to 100
}

export interface GradientState {
  type: "linear" | "radial";
  angle: number;
  stops: GradientStop[];
}

export interface MaskInfluenceSettings {
  enabled: boolean;
  min: number;
  max: number;
}

// Sub-state interfaces for better organization
export interface GridState {
  width: number; // Unit width
  height: number; // Unit height
  spacingX: number;
  spacingY: number;
  toggle: boolean;
  lineColor: string;
  cols: number;
  rows: number;
}

export interface UnitState {
  shape: ShapeType;
  strokeWidth: number;
  strokeColor: string;
  borderRadius: number | [number, number, number, number];
  customSvg: string | null;
  customBounds?: { x: number; y: number; width: number; height: number };
}

export interface TransformState {
  enabled: boolean;
  rotation: number;
  variance: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
}

export interface EffectsState {
  enabled: boolean;
  blur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOpacity: number;
}

export interface SequenceState {
  enabled: boolean;
  type: SequenceType;
  direction: SequenceDirection;
  angle: number;
  reverse: boolean;
  targets: {
    sizeX: { enabled: boolean; min: number; max: number };
    sizeY: { enabled: boolean; min: number; max: number };
    rotation: { enabled: boolean; min: number; max: number };
    opacity: { enabled: boolean; min: number; max: number };
    offsetX: { enabled: boolean; min: number; max: number };
    offsetY: { enabled: boolean; min: number; max: number };
  };
  customValues: number[];
}

export interface TransitionState {
  enabled: boolean;
  angle: number;
  curve: CurveType;
  contrast: number;
}

export interface MaskState {
  enabled: boolean;
  type: "image" | "perlin";
  imageData: ImageData | null;
  imageUrl: string | null;
  opacity: number;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  preview: {
    visible: boolean;
    opacity: number;
  };
  perlin: {
    scale: number;
    seed: number;
  };
  influence: string[]; // Deprecated
  settings: {
    width: MaskInfluenceSettings;
    height: MaskInfluenceSettings;
    opacity: MaskInfluenceSettings;
    rotation: MaskInfluenceSettings;
    radius: MaskInfluenceSettings;
    color: MaskInfluenceSettings;
    strokeWidth: MaskInfluenceSettings;
    x: MaskInfluenceSettings;
    y: MaskInfluenceSettings;
  };
}

export interface DistortionState {
  enabled: boolean;
  waveAmount: number;
  waveFreq: number;
  vortexAmount: number;
  vortexRadius: number;
}

// Layer Definition
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;

  // Composition
  grid: GridState;
  unit: UnitState;
  transform: TransformState;
  effects: EffectsState;
  sequence: SequenceState;
  transition: TransitionState;
  mask: MaskState;
  distortion: DistortionState;
  colors: {
    gradient: GradientState;
  };
}

export interface GeneratorState {
  canvas: {
    zoom: number;
  };
  colors: {
    background: string;
    showCanvasControls?: boolean;
  };

  // Layer System
  layers: Layer[];
  activeLayerId: string;

  presets: Preset[];
  history: {
    past: GeneratorState[];
    future: GeneratorState[];
  };
}

// --- Initial State ---

export interface Preset {
  id: string;
  name: string;
  thumbnail: string;
  state: Omit<GeneratorState, "history" | "presets">;
  timestamp: number;
}

const defaultLayerId = uuidv4();

const defaultLayer: Layer = {
  id: defaultLayerId,
  name: "Layer 1",
  visible: true,
  locked: false,
  grid: {
    width: 60,
    height: 60,
    spacingX: 20,
    spacingY: 20,
    toggle: false,
    lineColor: "rgba(255, 255, 255, 0.1)",
    cols: 10,
    rows: 10,
  },
  unit: {
    shape: "rect",
    strokeWidth: 0,
    strokeColor: "#ffffff",
    borderRadius: 0,
    customSvg: null,
    customBounds: undefined,
  },
  transform: {
    enabled: true,
    rotation: 0,
    variance: 0,
    scaleX: 1.0,
    scaleY: 1.0,
    skewX: 0,
    skewY: 0,
  },
  effects: {
    enabled: false,
    blur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: "#000000",
    shadowOpacity: 0.5,
  },
  sequence: {
    enabled: true,
    type: "geometric",
    direction: "radial",
    angle: 0,
    reverse: false,
    targets: {
      sizeX: { enabled: true, min: 1.0, max: 0.2 },
      sizeY: { enabled: true, min: 1.0, max: 0.2 },
      rotation: { enabled: true, min: 0, max: 90 },
      opacity: { enabled: false, min: -0.5, max: 0 },
      offsetX: { enabled: false, min: -20, max: 20 },
      offsetY: { enabled: false, min: -20, max: 20 },
    },
    customValues: [],
  },
  transition: { enabled: false, angle: 0, curve: "linear", contrast: 1.5 },
  mask: {
    enabled: true,
    type: "perlin",
    transform: { x: 0, y: 0, scale: 1, rotation: 0 },
    preview: { visible: true, opacity: 0.5 },
    perlin: { scale: 30, seed: 12345 },
    imageData: null,
    imageUrl: null,
    opacity: 80,
    influence: [],
    settings: {
      width: { enabled: true, min: 0.5, max: 1.5 },
      height: { enabled: true, min: 0.5, max: 1.5 },
      opacity: { enabled: false, min: 0.0, max: 1.0 },
      rotation: { enabled: false, min: -45, max: 45 },
      radius: { enabled: false, min: 0, max: 50 },
      color: { enabled: false, min: 0, max: 50 },
      strokeWidth: { enabled: false, min: 0, max: 10 },
      x: { enabled: false, min: -50, max: 50 },
      y: { enabled: false, min: -50, max: 50 },
    },
  },
  distortion: {
    enabled: false,
    waveAmount: 0,
    waveFreq: 1.0,
    vortexAmount: 0,
    vortexRadius: 200,
  },
  colors: {
    gradient: {
      type: "linear",
      angle: 45,
      stops: [
        { id: "1", color: "#00dc82", position: 0 },
        { id: "2", color: "#007fdc", position: 100 },
      ],
    },
  },
};

export const initialState: GeneratorState = {
  canvas: { zoom: 85 },
  colors: {
    background: "#0a0a0a",
    showCanvasControls: false,
  },
  layers: [defaultLayer],
  activeLayerId: defaultLayerId,
  presets: [],
  history: { past: [], future: [] },
};

// --- Actions ---

type Action =
  | { type: "SET_GRID"; payload: Partial<GridState> }
  | { type: "SET_CANVAS"; payload: Partial<GeneratorState["canvas"]> }
  | { type: "SET_UNIT"; payload: Partial<UnitState> }
  | { type: "SET_TRANSFORM"; payload: Partial<TransformState> }
  | { type: "SET_EFFECTS"; payload: Partial<EffectsState> }
  | { type: "SET_SEQUENCE"; payload: Partial<SequenceState> }
  | { type: "SET_TRANSITION"; payload: Partial<TransitionState> }
  | { type: "SET_MASK"; payload: Partial<MaskState> }
  | { type: "SET_DISTORTION"; payload: Partial<DistortionState> }
  | {
      type: "SET_COLORS";
      payload: Partial<GeneratorState["colors"] | Layer["colors"]>;
    }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "LOAD_PRESET"; payload: Partial<GeneratorState> }
  | { type: "ADD_PRESET"; payload: Preset }
  | { type: "DELETE_PRESET"; payload: string }
  // Layer Actions
  | { type: "ADD_LAYER" }
  | { type: "DELETE_LAYER"; payload: string }
  | { type: "DUPLICATE_LAYER"; payload: string }
  | { type: "SET_ACTIVE_LAYER"; payload: string }
  | { type: "REORDER_LAYERS"; payload: Layer[] }
  | { type: "UPDATE_LAYER"; payload: { id: string; updates: Partial<Layer> } };

// --- Reducer ---

const getPresentState = (
  state: GeneratorState
): Omit<GeneratorState, "history"> => {
  const { history, ...rest } = state;
  return rest;
};

const MAX_HISTORY = 20;

function reducer(state: GeneratorState, action: Action): GeneratorState {
  const saveHistory = (
    prevState: GeneratorState
  ): GeneratorState["history"] => {
    const newPast = [
      ...prevState.history.past,
      getPresentState(prevState) as any,
    ];
    if (newPast.length > MAX_HISTORY) newPast.shift();
    return {
      past: newPast,
      future: [],
    };
  };

  // Helper to update active layer
  const updateActiveLayer = (updates: Partial<Layer>) => {
    return {
      ...state,
      history: saveHistory(state),
      layers: state.layers.map((layer) =>
        layer.id === state.activeLayerId ? { ...layer, ...updates } : layer
      ),
    };
  };

  // Helper to update specific sub-state of active layer
  const updateActiveLayerProp = <K extends keyof Layer>(
    prop: K,
    payload: any
  ) => {
    return {
      ...state,
      history: saveHistory(state),
      layers: state.layers.map((layer) =>
        layer.id === state.activeLayerId
          ? { ...layer, [prop]: { ...layer[prop], ...payload } }
          : layer
      ),
    };
  };

  switch (action.type) {
    case "SET_GRID":
      return updateActiveLayerProp("grid", action.payload);
    case "SET_UNIT":
      return updateActiveLayerProp("unit", action.payload);
    case "SET_TRANSFORM":
      return updateActiveLayerProp("transform", action.payload);
    case "SET_EFFECTS":
      return updateActiveLayerProp("effects", action.payload);
    case "SET_SEQUENCE":
      return updateActiveLayerProp("sequence", action.payload);
    case "SET_TRANSITION":
      return updateActiveLayerProp("transition", action.payload);
    case "SET_DISTORTION":
      return updateActiveLayerProp("distortion", action.payload);

    case "SET_MASK":
      // Special handling for Mask because of nested settings
      return {
        ...state,
        history: saveHistory(state),
        layers: state.layers.map((layer) => {
          if (layer.id !== state.activeLayerId) return layer;
          return {
            ...layer,
            mask: {
              ...layer.mask,
              ...action.payload,
            },
          };
        }),
      };

    case "SET_COLORS":
      // Check if payload contains global color props or layer gradient props
      const payload = action.payload as any;
      const globalUpdates: any = {};
      const layerUpdates: any = {};

      if ("background" in payload)
        globalUpdates.background = payload.background;
      if ("showCanvasControls" in payload)
        globalUpdates.showCanvasControls = payload.showCanvasControls;
      if ("gradient" in payload) layerUpdates.gradient = payload.gradient;

      let newState = { ...state };
      if (Object.keys(globalUpdates).length > 0) {
        newState = {
          ...newState,
          colors: { ...newState.colors, ...globalUpdates },
          history: saveHistory(state),
        };
      }

      if (Object.keys(layerUpdates).length > 0) {
        newState = {
          ...newState,
          history: saveHistory(state),
          layers: newState.layers.map((layer) =>
            layer.id === newState.activeLayerId
              ? { ...layer, colors: { ...layer.colors, ...layerUpdates } }
              : layer
          ),
        };
      }
      return newState;

    case "SET_CANVAS":
      return {
        ...state,
        history: saveHistory(state),
        canvas: { ...state.canvas, ...action.payload },
      };

    // --- Layer Actions ---
    case "ADD_LAYER": {
      const newLayer: Layer = {
        ...defaultLayer,
        id: uuidv4(),
        name: `Layer ${state.layers.length + 1}`,
      };
      return {
        ...state,
        history: saveHistory(state),
        layers: [...state.layers, newLayer],
        activeLayerId: newLayer.id,
      };
    }
    case "DELETE_LAYER": {
      if (state.layers.length <= 1) return state; // Prevent deleting last layer
      const newLayers = state.layers.filter((l) => l.id !== action.payload);
      return {
        ...state,
        history: saveHistory(state),
        layers: newLayers,
        activeLayerId:
          state.activeLayerId === action.payload
            ? newLayers[0].id
            : state.activeLayerId,
      };
    }
    case "DUPLICATE_LAYER": {
      const layerToDup = state.layers.find((l) => l.id === action.payload);
      if (!layerToDup) return state;
      const newLayer = {
        ...layerToDup,
        id: uuidv4(),
        name: `${layerToDup.name} Copy`,
      };
      return {
        ...state,
        history: saveHistory(state),
        layers: [...state.layers, newLayer],
        activeLayerId: newLayer.id,
      };
    }
    case "SET_ACTIVE_LAYER":
      return { ...state, activeLayerId: action.payload };

    case "REORDER_LAYERS":
      return { ...state, history: saveHistory(state), layers: action.payload };

    case "UPDATE_LAYER":
      return {
        ...state,
        history: saveHistory(state),
        layers: state.layers.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.updates } : l
        ),
      };

    case "UNDO":
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      return {
        ...state,
        ...previous,
        history: {
          past: newPast,
          future: [getPresentState(state) as any, ...state.history.future],
        },
      };

    case "REDO":
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      return {
        ...state,
        ...next,
        history: {
          past: [...state.history.past, getPresentState(state) as any],
          future: newFuture,
        },
      };

    case "LOAD_PRESET":
      // Need to handle migration if preset is old format
      // For now assume payload is compatible or we might need a migration helper
      // If payload has 'layers', use it. If not, wrap in default layer.
      const loadedState = action.payload as any;
      let finalLayers = loadedState.layers;

      if (!finalLayers) {
        // Migration for old presets: map old root props to a single layer
        // This is a simplified migration
        finalLayers = [
          {
            ...defaultLayer,
            id: uuidv4(),
            grid: loadedState.grid || defaultLayer.grid,
            unit: loadedState.unit || defaultLayer.unit,
            transform: loadedState.transform || defaultLayer.transform,
            effects: loadedState.effects || defaultLayer.effects,
            sequence: loadedState.sequence || defaultLayer.sequence,
            transition: loadedState.transition || defaultLayer.transition,
            mask: loadedState.mask || defaultLayer.mask,
            distortion: loadedState.distortion || defaultLayer.distortion,
            colors: {
              gradient:
                loadedState.colors?.gradient || defaultLayer.colors.gradient,
            },
          },
        ];
      }

      return {
        ...state,
        ...loadedState,
        layers: finalLayers,
        activeLayerId: finalLayers[0].id,
        presets: state.presets, // Preserve presets
        history: { past: [], future: [] },
      };
    case "ADD_PRESET":
      return { ...state, presets: [...state.presets, action.payload] };
    case "DELETE_PRESET":
      return {
        ...state,
        presets: state.presets.filter((p) => p.id !== action.payload),
      };

    default:
      return state;
  }
}

// --- Context ---

const GeneratorContext = createContext<
  | {
      state: GeneratorState;
      dispatch: Dispatch<Action>;
    }
  | undefined
>(undefined);

export const GeneratorProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GeneratorContext.Provider value={{ state, dispatch }}>
      {children}
    </GeneratorContext.Provider>
  );
};

export const useGenerator = () => {
  const context = useContext(GeneratorContext);
  if (!context) {
    throw new Error("useGenerator must be used within a GeneratorProvider");
  }
  return context;
};
