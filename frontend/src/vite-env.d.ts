/// <reference types="vite/client" />
import type { Data } from "unist";

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "hast" {
  interface Data {
    label?: string;
    actions?: {
      name: string;
      parameters: string[];
    }[];
  }
}

export interface Action extends Node {
  /**
   * Custom node type for action.
   */
  type: "action";
  /**
   * Data associated with the action.
   */
  data?: ActionData | undefined;
}

export interface ActionData extends Data {
  label: string;
  actions: {
    name: string;
    parameters: string[];
  }[];
}

declare module "mdast" {
  interface PhrasingContentMap {
    action: Action;
  }
}
