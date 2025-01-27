// import { WritableDraft } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Sheet = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

type PanelHandle = {
  isDragging: boolean;
  setDragging: (dragging: boolean) => void;
};

type Panel = {
  size: number;
  setSize: (size: number) => void;
  handle: PanelHandle;
};

type BuilderState = {
  sheet: {
    left: Sheet;
    right: Sheet;
  };
  panel: {
    left: Panel;
    right: Panel;
  };
};

type BuilderActions = {
  toggle: (side: "left" | "right") => void;
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  immer((set) => ({
    sheet: {
      left: {
        open: false,
        setOpen: (open) => {
          set((state) => {
            state.sheet.left.open = open;
          });
        },
      },
      right: {
        open: false,
        setOpen: (open) => {
          set((state) => {
            state.sheet.right.open = open;
          });
        },
      },
    },
    panel: {
      left: {
        size: 0,
        setSize: (size) => {
          set((state) => {
            state.panel.left.size = size;
          });
        },
        handle: {
          isDragging: false,
          setDragging: (dragging) => {
            set((state) => {
              state.panel.left.handle.isDragging = dragging;
            });
          },
        },
      },
      right: {
        size: 0,
        setSize: (size) => {
          set((state) => {
            state.panel.right.size = size;
          });
        },
        handle: {
          isDragging: false,
          setDragging: (dragging) => {
            set((state) => {
              state.panel.right.handle.isDragging = dragging;
            });
          },
        },
      },
    },
    toggle: (side) => {
      set((state) => {
        state.sheet[side].open = !state.sheet[side].open;
      });
    },
  })),
);
