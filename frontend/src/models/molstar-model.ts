import { entriesDownload, shareLinksDownload } from "@/lib/client";
import { MolViewSpec } from "molstar/lib/extensions/mvs/behavior";
import { loadMVSX } from "molstar/lib/extensions/mvs/components/formats";
import { loadMVS } from "molstar/lib/extensions/mvs/load";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import {
  DefaultPluginUISpec,
  type PluginUISpec,
} from "molstar/lib/mol-plugin-ui/spec";
import { PluginSpec } from "molstar/lib/mol-plugin/spec";
import { Task } from "molstar/lib/mol-task";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { toast } from "sonner";

export class MolstarModel {
  public plugin: PluginUIContext;
  private subscriptions: Subscription[] = [];

  public state = {
    isInitialized: new BehaviorSubject<boolean>(false),
  };

  constructor() {
    const defaultSpec = DefaultPluginUISpec();
    const spec: PluginUISpec = {
      ...defaultSpec,
      behaviors: [PluginSpec.Behavior(MolViewSpec), ...defaultSpec.behaviors],
    };

    this.plugin = new PluginUIContext(spec);
  }

  subscribe<T>(observable: Observable<T>, sub: (v: T) => void) {
    this.subscriptions.push(observable.subscribe(sub));
  }

  mount() {}

  dispose() {
    for (const sub of this.subscriptions) sub.unsubscribe();
    this.subscriptions = [];
  }

  async init() {
    if (this.state.isInitialized.value) return;
    try {
      await this.plugin.init();
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    this.state.isInitialized.next(true);
  }

  async load({
    entry_id,
    share_link_id,
  }: {
    entry_id?: string;
    share_link_id?: string;
  }) {
    const toastId = toast.loading("Downloading MVSX data...");

    try {
      let response;

      if (share_link_id) {
        response = await shareLinksDownload({
          path: { share_link_id },
          query: {
            format_type: "mvsx",
          },
          parseAs: "arrayBuffer",
        });
      } else if (entry_id) {
        response = await entriesDownload({
          path: { entry_id },
          query: {
            format_type: "mvsx",
          },
          parseAs: "arrayBuffer",
        });
      } else {
        console.error("Missing");
        return;
      }

      const { data, error } = response;
      if (error || !data) {
        throw Error("Failed to download MVSX file");
      }

      toast.loading("Loading MVSX file...", { id: toastId });

      await this.plugin.runTask(
        Task.create("Load MVSX file", async (ctx) => {
          const binaryData = new Uint8Array(data as ArrayBuffer);
          const parsed = await loadMVSX(this.plugin, ctx, binaryData);
          await loadMVS(this.plugin, parsed.mvsData, {
            sanityChecks: true,
            sourceUrl: parsed.sourceUrl,
            keepCamera: true,
          });
        }),
      );
      toast.success("Scene loaded successfully", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load scene", { id: toastId });
    }
  }
}
