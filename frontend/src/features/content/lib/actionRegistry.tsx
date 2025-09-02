import { Input } from "@/components/ui/input";
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
  id: string;
  label: string;
  description?: string;
  schema: ZodSchema<any>;
  handler: ActionFunction;
  form?: React.FC<{
    params: any;
    setParams: (updater: (prev: any) => any) => void;
  }>;
};

const functionRegistry = new Map<string, ActionFunctionEntry>();

export function getActionFunctions(): ActionFunctionEntry[] {
  return Array.from(functionRegistry.values());
}

export function registerActionFunction(entry: ActionFunctionEntry) {
  functionRegistry.set(entry.id, entry);
}

export function getActionFunction(
  name: string,
): ActionFunctionEntry | undefined {
  return functionRegistry.get(name);
}

registerActionFunction({
  id: "log",
  label: "Log",
  description: "Logs a message",
  schema: z.object({ message: z.string() }),
  handler: ({ message }) => console.log("Logging:", message),
  form: ({ params, setParams }) => (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium">Message</label>
      <input
        type="text"
        className="border p-1 rounded"
        value={params.message || ""}
        onChange={(e) =>
          setParams((prev) => ({ ...prev, message: e.target.value }))
        }
      />
    </div>
  ),
});

// registerActionFunction({
//   id: "sum",
//   label: "Sum two numbers",
//   description: "Adds two numbers",
//   schema: z.array(z.number()),
//   handler: (param) =>
//     console.log(
//       "Sum:",
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       param.reduce((prev: any, current: any) => prev + current, 0),
//     ),
// });

// registerActionFunction({
//   id: "loadPdb",
//   label: "Load PDB",
//   description: "Loads a PDB structure",
//   schema: z.object({
//     id: z.string(),
//     clearViewer: z.boolean(),
//   }),
//   handler: async (params, { viewer }) => {
//     console.log(
//       "params",
//       params.id,
//       params.clearViewer,
//       typeof params === "object",
//     );
//     if (Array.isArray(params)) {
//       await viewer.loadPdb(params[0]);
//     } else {
//       await viewer.loadPdb(params.id, params.clearViewer);
//     }
//   },
// });

// registerActionFunction({
//   id: "loadAlphaFoldDB",
//   label: "Load AlphaFoldDB",
//   description: "Loads an AlphaFoldDB structure",
//   schema: z.object({
//     id: z.string(),
//   }),
//   handler: async ({ id }, { viewer }) => {
//     await viewer.loadAlphaFoldDB(id);
//   },
// });

// registerActionFunction({
//   id: "loadView",
//   label: "Load View",
//   description: "Loads a View by ID",
//   schema: z.tuple([z.string()]).refine((params) => params.length === 1, {
//     message: "loadView must receive exactly 1 parameter",
//   }),
//   handler: async ([viewId], { viewer }) => {
//     const { data } = await viewsGetViewSnapshot({
//       path: {
//         view_id: viewId,
//       },
//     });
//     await viewer.loadSnapshot(data);
//   },
// });

// registerActionFunction({
//   id: "loadCvsx",
//   description: "Loads a CVSX file",
//   schema: z.tuple([z.string()]).refine((params) => params.length === 1, {
//     message: "loadView must receive exactly 1 parameter",
//   }),
//   handler: async ([entryId], { viewer }) => {
//     await viewer.loadVolseg(entryId);
//   },
// });

const LoadViewForm = ({
  params,
  setParams,
}: {
  params: any;
  setParams: (fn: (prev: any) => any) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium">View ID</label>
      <Input
        type="text"
        value={params.viewId || ""}
        onChange={(e) =>
          setParams({
            viewId: e.target.value,
          })
        }
        placeholder="Enter view ID"
      />
    </div>
  );
};

registerActionFunction({
  id: "loadView",
  label: "Load View",
  description: "Loads a View by ID",
  schema: z.object({ viewId: z.string() }),
  handler: async ({ viewId }, { viewer }: { viewer: MolstarViewerModel }) => {
    const { data } = await viewsGetViewSnapshot({
      path: { view_id: viewId },
    });
    await viewer.loadSnapshot(data);
  },
  form: LoadViewForm,
});

const LoadPdbForm = ({
  params,
  setParams,
}: {
  params: any;
  setParams: (fn: (prev: any) => any) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium">PDB ID</label>
      <Input
        type="text"
        value={params.pdbId || ""}
        onChange={(e) => setParams({ ...params, pdbId: e.target.value })}
        placeholder="Enter PDB ID"
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={params.clearViewer || false}
          onChange={(e) =>
            setParams({ ...params, clearViewer: e.target.checked })
          }
        />
        Clear Viewer Before Loading
      </label>
    </div>
  );
};

registerActionFunction({
  id: "loadPdb",
  label: "Load PDB",
  description: "Loads a PDB structure",
  schema: z.object({
    pdbId: z.string(),
    clearViewer: z.boolean().default(false),
  }),
  handler: async (
    { pdbId, clearViewer },
    { viewer }: { viewer: MolstarViewerModel },
  ) => {
    await viewer.loadPdb(pdbId, clearViewer);
  },
  form: LoadPdbForm,
});

const LoadAlphaFoldForm = ({
  params,
  setParams,
}: {
  params: any;
  setParams: (fn: (prev: any) => any) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium">AlphaFold ID</label>
      <Input
        type="text"
        value={params.id || ""}
        onChange={(e) => setParams({ ...params, id: e.target.value })}
        placeholder="Enter AlphaFold ID"
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={params.clearViewer || false}
          onChange={(e) =>
            setParams({ ...params, clearViewer: e.target.checked })
          }
        />
        Clear Viewer Before Loading
      </label>
    </div>
  );
};

registerActionFunction({
  id: "loadAlphaFoldDB",
  label: "Load AlphaFoldDB",
  description: "Loads an AlphaFoldDB structure",
  schema: z.object({
    id: z.string(),
    clearViewer: z.boolean().default(false),
  }),
  handler: async (
    { id, clearViewer },
    { viewer }: { viewer: MolstarViewerModel },
  ) => {
    console.log(id, clearViewer);
    await viewer.loadAlphaFoldDB(id, clearViewer);
  },
  form: LoadAlphaFoldForm,
});
