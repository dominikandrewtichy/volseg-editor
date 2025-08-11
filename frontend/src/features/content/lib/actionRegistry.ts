import { MolstarViewerModel } from "@/features/molstar/models/molstar-viewer";
import { viewsGetViewSnapshot } from "@/lib/client";
import { ZodSchema, z } from "zod";

export type InjectedDeps = {
  viewer: MolstarViewerModel;
};

export type ActionFunction = (
  params: any,
  deps: InjectedDeps,
) => void | Promise<void>;

export type ActionFunctionEntry = {
  name: string;
  description?: string;
  schema: ZodSchema<any>;
  handler: ActionFunction;
};

const functionRegistry = new Map<string, ActionFunctionEntry>();

export function registerActionFunction(entry: ActionFunctionEntry) {
  functionRegistry.set(entry.name, entry);
}

export function getActionFunction(
  name: string,
): ActionFunctionEntry | undefined {
  return functionRegistry.get(name);
}

registerActionFunction({
  name: "log",
  description: "Logs a message",
  schema: z.array(z.string()),
  handler: (param) => console.log("Logging:", param),
});

registerActionFunction({
  name: "sum",
  description: "Adds two numbers",
  schema: z.array(z.number()),
  handler: (param) =>
    console.log(
      "Sum:",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      param.reduce((prev: any, current: any) => prev + current, 0),
    ),
});

registerActionFunction({
  name: "loadPdb",
  description: "Loads a PDB structure",
  schema: z.object({
    id: z.string(),
    clearViewer: z.boolean(),
  }),
  handler: async (params, { viewer }) => {
    console.log(
      "params",
      params.id,
      params.clearViewer,
      typeof params === "object",
    );
    if (Array.isArray(params)) {
      await viewer.loadPdb(params[0]);
    } else {
      await viewer.loadPdb(params.id, params.clearViewer);
    }
  },
});

registerActionFunction({
  name: "loadAlphaFoldDB",
  description: "Loads an AlphaFoldDB structure",
  schema: z.object({
    id: z.string(),
  }),
  handler: async ({ id }, { viewer }) => {
    await viewer.loadAlphaFoldDB(id);
  },
});

registerActionFunction({
  name: "loadView",
  description: "Loads a View by ID",
  schema: z.tuple([z.string()]).refine((params) => params.length === 1, {
    message: "loadView must receive exactly 1 parameter",
  }),
  handler: async ([viewId], { viewer }) => {
    const { data } = await viewsGetViewSnapshot({
      path: {
        view_id: viewId,
      },
    });
    await viewer.loadSnapshot(data);
  },
});

registerActionFunction({
  name: "loadCvsx",
  description: "Loads a CVSX file",
  schema: z.tuple([z.string()]).refine((params) => params.length === 1, {
    message: "loadView must receive exactly 1 parameter",
  }),
  handler: async ([entryId], { viewer }) => {
    await viewer.loadVolseg(entryId);
  },
});
