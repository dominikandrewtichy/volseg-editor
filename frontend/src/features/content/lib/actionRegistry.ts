import { MolstarViewerModel } from "@/features/molstar/models/molstar-viewer";
import { viewsGetViewSnapshot } from "@/lib/client";
import { ZodSchema, z } from "zod";

export type InjectedDeps = {
  viewer: MolstarViewerModel;
};

export type ActionFunction = (
  params: any[],
  deps: InjectedDeps,
) => void | Promise<void>;

export type ActionFunctionEntry = {
  name: string;
  description?: string;
  schema: ZodSchema<any[]>;
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
      param.reduce((prev, current) => prev + current, 0),
    ),
});

registerActionFunction({
  name: "loadPdb",
  description: "Loads a PDB file from a URL",
  schema: z
    .tuple([z.string().url("The parameter must be a valid URL")])
    .refine((params) => params.length === 1, {
      message: "loadPdb must receive exactly one URL parameter",
    }),
  handler: async ([url], { viewer }) => {
    await viewer.loadPdb(url);
  },
});

registerActionFunction({
  name: "loadView",
  description: "Loads a View by ID",
  schema: z
    .tuple([z.string().uuid("The parameter must be a valid UUID v4")])
    .refine((params) => params.length === 1, {
      message: "loadView must receive exactly one UUID parameter",
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
