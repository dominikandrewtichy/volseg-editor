import { Theme } from "@/features/theme/ThemeContext";
import { Segment, volsegEntriesGetSnapshotFile } from "@/lib/client";
import { BaseReactiveModel } from "@/lib/models/base-model";
import {
  actionSelectSegment,
  actionShowSegments,
  findNodesByTags,
} from "@/volseg/src/common";
import { CVSXSpec } from "@/volseg/src/extensions/cvsx-extension/behaviour";
import { VolsegEntryData } from "@/volseg/src/extensions/volumes-and-segmentations/entry-root";
import { SEGMENT_VISUAL_TAG } from "@/volseg/src/extensions/volumes-and-segmentations/entry-segmentation";
import { createSegmentKey } from "@/volseg/src/extensions/volumes-and-segmentations/volseg-api/utils";
import { Volume } from "molstar/lib/commonjs/mol-model/volume";
import { OpenFiles } from "molstar/lib/commonjs/mol-plugin-state/actions/file";
import { PluginStateSnapshotManager } from "molstar/lib/commonjs/mol-plugin-state/manager/snapshots";
import { PluginStateObject } from "molstar/lib/commonjs/mol-plugin-state/objects";
import {
  Download,
  ParseCif,
} from "molstar/lib/commonjs/mol-plugin-state/transforms/data";
import { TrajectoryFromMmCif } from "molstar/lib/commonjs/mol-plugin-state/transforms/model";
import { PluginUIContext } from "molstar/lib/commonjs/mol-plugin-ui/context";
import {
  DefaultPluginUISpec,
  PluginUISpec,
} from "molstar/lib/commonjs/mol-plugin-ui/spec";
import { PluginCommands } from "molstar/lib/commonjs/mol-plugin/commands";
import { PluginSpec } from "molstar/lib/commonjs/mol-plugin/spec";
import { PluginState } from "molstar/lib/commonjs/mol-plugin/state";
import { StateSelection } from "molstar/lib/commonjs/mol-state";
import { UUID } from "molstar/lib/commonjs/mol-util";
import { Color } from "molstar/lib/commonjs/mol-util/color";
import { BehaviorSubject, debounceTime, merge, skip } from "rxjs";

type InitializationState = "pending" | "initializing" | "success" | "error";

export class MolstarViewerModel extends BaseReactiveModel {
  public plugin: PluginUIContext;
  private _theme = {
    dark: Color(0x000000),
    light: Color(0xffffff),
  };

  public state = {
    isInitialized: new BehaviorSubject<InitializationState>("pending"),
    isLoading: new BehaviorSubject<boolean>(false),
    showControls: new BehaviorSubject<boolean>(false),
    isExpanded: new BehaviorSubject<boolean>(false),
    segment: new BehaviorSubject<Segment | undefined>(undefined),
    volsegEntry: new BehaviorSubject<string | undefined>(undefined),
    showSequenceView: new BehaviorSubject<boolean>(false),
  };

  constructor() {
    super();

    const currentTheme = this.getCurrentTheme();

    const defaultSpec = DefaultPluginUISpec();
    const spec: PluginUISpec = {
      ...defaultSpec,
      behaviors: [PluginSpec.Behavior(CVSXSpec), ...defaultSpec.behaviors],
      layout: {
        initial: {
          ...defaultSpec.layout?.initial,
          isExpanded: this.state.isExpanded.value,
          showControls: this.state.showControls.value,
        },
      },
      canvas3d: {
        renderer: {
          ...defaultSpec.canvas3d?.renderer,
          backgroundColor:
            currentTheme === "dark" ? this._theme.dark : this._theme.light,
        },
      },
    };

    this.plugin = new PluginUIContext(spec);
  }

  mount() {
    // sync UI layout controls
    this.subscribe(this.plugin.layout.events.updated, () => {
      this.state.showControls.next(this.plugin.layout.state.showControls);
      this.state.isExpanded.next(this.plugin.layout.state.isExpanded);
    });

    this.subscribe(this.state.isInitialized, (isInitialized) => {
      if (isInitialized) {
        this.mountAfterInit();
      }
    });

    // show/hide sequence viewer if there is a structure with sequence loaded
    this.subscribe(
      merge(
        this.plugin.state.events.object.created,
        this.plugin.state.events.object.updated,
        this.plugin.state.events.object.removed,
      ).pipe(debounceTime(250)),
      () => {
        const count = this.plugin.state.data.select(
          StateSelection.Generators.rootsOfType(
            PluginStateObject.Molecule.Structure,
          ),
        ).length;
        const show = count > 0;
        this.state.showSequenceView.next(show);
      },
    );

    // this.subscribe(this.plugin.state.events.object.updated, ({ obj }) => {
    //   if (obj && obj.type === PluginStateObject.Molecule.Structure.type) {
    //     this.state.showSequenceView.next(true);
    //   }
    // });

    // this.subscribe(this.plugin.state.events.object.created, ({ obj }) => {
    //   if (obj && obj.type === PluginStateObject.Molecule.Structure.type) {
    //     this.state.showSequenceView.next(true);
    //   }
    // });

    // this.subscribe(this.plugin.state.events.object.removed, ({ obj }) => {
    //   if (obj && obj.type === PluginStateObject.Molecule.Structure.type) {
    //     this.state.showSequenceView.next(true);
    //   }
    // });

    // this.subscribe(this.state.showSequenceView, (show) => {
    //   const count = this.plugin.state.data.select(
    //     StateSelection.Generators.rootsOfType(
    //       PluginStateObject.Molecule.Structure,
    //     ),
    //   ).length;
    //   console.log(show, count);
    //   this.state.showSequenceView.next(count > 0);
    // });

    // this.subscribe(this.plugin.events.log, (message) => {
    //   console.log(message);
    // });
    // this.subscribe(
    //   combineLatest([
    //     this.plugin.behaviors.state.isUpdating,
    //     this.plugin.behaviors.state.isAnimating,
    //     // this.plugin.behaviors.state.isBusy,
    //   ]),
    //   (states) => {
    //     console.log("isLoading?", states);
    //     this.state.isLoading.next(states.some((x) => x == true));
    //   },
    // );
    //   const root = document.documentElement;

    //   const observer = new MutationObserver(() => {
    //     const themeClass = [...root.classList].find(
    //       (c) => c === "light" || c === "dark",
    //     );
    //     console.log(themeClass);
    //     if (themeClass) {
    //       this.updateTheme(themeClass);
    //     }
    //   });

    //   observer.observe(root, {
    //     attributes: true,
    //     attributeFilter: ["class"],
    //   });

    //   // Run immediately on mount
    //   const initialTheme = [...root.classList].find(
    //     (c) => c === "light" || c === "dark",
    //   );
    //   console.log(initialTheme);
    //   if (initialTheme) {
    //     this.updateTheme(initialTheme);
    //   }
    // }

    // async updateTheme(color: Exclude<Theme, "system">) {
    //   if (!this.plugin.canvas3d) return;

    //   const backgroundColor =
    //     color === "light" ? Color(0xffffff) : Color(0x000000);

    //   await PluginCommands.Canvas3D.SetSettings(this.plugin, {
    //     settings: {
    //       renderer: {
    //         ...this.plugin.canvas3d.props.renderer,
    //         backgroundColor: backgroundColor,
    //       },
    //     },
    //   });
  }

  mountAfterInit() {
    this.subscribe(this.state.segment.pipe(skip(1)), (segment) => {
      if (!segment) {
        this.resetSegmentVisibility();
      } else {
        this.focusSegment(segment);
      }
    });

    this.subscribe(this.state.volsegEntry.pipe(), async (entryId) => {
      if (!entryId) {
        this.clear();
      } else {
        await this.loadVolseg(entryId);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener("theme-change", async (e: any) => {
      const newTheme = e.detail.theme;
      await this.updateTheme(newTheme);
    });

    // Set screenshot parameters
    if (this.plugin.helpers.viewportScreenshot) {
      const params = this.plugin.helpers.viewportScreenshot.values;
      this.plugin.helpers.viewportScreenshot.behaviors.values.next({
        ...params,
        transparent: true,
        resolution: {
          name: "hd",
          params: {},
        },
      });
    }
  }

  async init() {
    if (this.state.isInitialized.value !== "pending") return;

    this.state.isInitialized.next("initializing");
    try {
      await this.plugin.init();
    } catch (err) {
      console.error("Failed to copy text: ", err);
      this.state.isInitialized.next("error");
    }
    this.state.isInitialized.next("success");
  }

  async clear(): Promise<void> {
    await this.plugin.clear();
  }

  getCurrentTheme(): Exclude<Theme, "system"> {
    const theme = localStorage.getItem("theme");
    if (theme) return theme as Exclude<Theme, "system">;

    const root = document.documentElement;
    if (root.classList.contains("dark")) return "dark";
    if (root.classList.contains("light")) return "light";
    return "dark";
  }

  async updateTheme(color: Exclude<Theme, "system">) {
    if (!this.plugin.canvas3d) return;

    const backgroundColor =
      color === "dark" ? this._theme.dark : this._theme.light;

    await PluginCommands.Canvas3D.SetSettings(this.plugin, {
      settings: {
        renderer: {
          ...this.plugin.canvas3d.props.renderer,
          backgroundColor: backgroundColor,
        },
      },
    });
    this.plugin.events.canvas3d.settingsUpdated.next(void 0);
  }

  async screenshot(): Promise<string> {
    // generate new screenshot of render
    const screenshot = await PluginStateSnapshotManager.getCanvasImageAsset(
      this.plugin,
      "screenshot.png",
    );
    if (!screenshot) throw new Error("no image");
    const file = this.plugin.managers.asset.get(screenshot)?.file;
    if (!file) throw new Error("no file");
    return URL.createObjectURL(file);
  }

  async thumbnailImage(): Promise<File> {
    // generate new screenshot of render
    const screenshot = await PluginStateSnapshotManager.getCanvasImageAsset(
      this.plugin,
      "screenshot.png",
    );
    if (!screenshot) throw new Error("no image");
    const file = this.plugin.managers.asset.get(screenshot)?.file;
    if (!file) throw new Error("no file");
    return file;
  }

  getSnapshot(): PluginState.Snapshot {
    return this.plugin.state.getSnapshot({
      // don't save canvas (background color etc)
      canvas3d: false,
      canvas3dContext: false,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadSnapshot(snapshot: any) {
    if (this.state.isLoading.value) return;

    this.state.isLoading.next(true);

    try {
      await this.plugin.state.setSnapshot(snapshot);
    } catch (error) {
      console.error("Error loading snapshot:", error);
      throw error;
    } finally {
      this.state.isLoading.next(false);
    }
  }

  async loadVolseg(entryId: string) {
    if (this.state.isLoading.value) return;

    this.state.isLoading.next(true);

    const response = await volsegEntriesGetSnapshotFile({
      path: {
        volseg_entry_id: entryId,
      },
    });
    const snapshot = response.data as PluginState.Snapshot;

    await this.plugin.state.setSnapshot(snapshot);
    this.plugin.managers.camera.reset();

    this.state.isLoading.next(false);
  }

  async loadFile(file: File): Promise<boolean> {
    const task = this.plugin.state.data.applyAction(OpenFiles, {
      files: [
        {
          id: UUID.createv4(),
          kind: "file",
          name: file.name,
          file: file,
        },
      ],
      format: {
        name: "auto",
        params: {},
      },
      visuals: false,
    });
    try {
      await task.run();
      return true;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
      } else {
        console.error(`Unknown error: ${e}`);
      }
      return false;
    }
  }

  async loadCvsxFile(file: File): Promise<PluginState.Snapshot | null> {
    const result = await this.loadingWrapper<boolean>(async () => {
      await this.clear();
      const result = await this.loadFile(file);
      await PluginCommands.Camera.Reset(this.plugin, {});
      return result;
    });

    if (!result) {
      return null;
    }
    return this.getSnapshot();
  }

  async loadingWrapper<T>(fn: () => Promise<T>) {
    this.state.isLoading.next(true);
    try {
      await fn();
      return true;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
      } else {
        console.error(`Unknown error: ${e}`);
      }
    } finally {
      this.state.isLoading.next(false);
    }
  }

  getVolsegEntryNode(entryId: string): VolsegEntryData | undefined {
    for (const node of this.plugin.state.data.cells.values()) {
      if (node.obj?.label === entryId) {
        return node.obj.data;
      }
    }
  }

  makeLoci(segments: number[], segmentationId: string) {
    const visual = findNodesByTags(
      this.plugin,
      SEGMENT_VISUAL_TAG,
      segmentationId,
    )[0];
    if (!visual) return undefined;
    const repr = visual.obj?.data.repr;
    const wholeLoci = repr.getAllLoci()[0];
    if (!wholeLoci || !Volume.Segment.isLoci(wholeLoci)) return undefined;
    return {
      loci: Volume.Segment.Loci(wholeLoci.volume, segments),
      repr: repr,
    };
  }

  focusSegment(segment: Segment) {
    const segmentLoci = this.makeLoci(
      [segment.segment_id],
      segment.segmentation_id,
    );

    if (!segmentLoci) return;

    this.plugin.managers.camera.focusLoci(segmentLoci.loci);
    this.plugin.managers.interactivity.lociHighlights.highlightOnly(
      segmentLoci,
    );
    this.plugin.managers.interactivity.lociSelects.deselectAll();
    this.plugin.managers.interactivity.lociSelects.selectOnly(segmentLoci);
  }

  async showSegment(entry_id: string, segment: Segment) {
    const key = createSegmentKey(
      segment.segment_id,
      segment.segmentation_id,
      segment.kind,
    );
    const node = this.getVolsegEntryNode(entry_id);

    if (!node) return;

    const segmentLoci = this.makeLoci(
      [segment.segment_id],
      segment.segmentation_id,
    );

    if (!segmentLoci) return;

    // this.plugin.managers.camera.focusLoci(segmentLoci.loci, false);
    // this.plugin.managers.interactivity.lociSelects.select(segmentLoci, false);
    // await actionToggleSegment(node, key);
    await actionShowSegments([key], node);
  }

  resetSegmentVisibility() {
    this.plugin.managers.interactivity.lociSelects.deselectAll();
    this.plugin.managers.interactivity.lociHighlights.clearHighlights();
    this.plugin.managers.camera.reset();
  }

  async loadPdb(pdbId: string) {
    try {
      await this.clear();

      const url = `https://www.ebi.ac.uk/pdbe/entry-files/download/${pdbId}.bcif`;

      const rawData = await this.plugin.builders.data.download({
        url,
        isBinary: true,
      });

      const trajectory = await this.plugin.builders.structure.parseTrajectory(
        rawData,
        "mmcif",
      );

      const model = await this.plugin.builders.structure.hierarchy.applyPreset(
        trajectory,
        "default",
      );

      if (model?.structure?.cell?.status === "error") {
        throw new Error("Failed to load PDB structure");
      }
    } catch (error) {
      console.log("Error loading PDB:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to load PDB structure",
      );
    }
  }

  async loadAlphaFoldDB(uniprotId: string) {
    try {
      await this.clear();

      const url = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.cif`;

      const response = await fetch(url);
      const structure = await response.text();

      const rawData = await this.plugin.builders.data.rawData({
        data: structure,
      });

      const trajectory = await this.plugin.builders.structure.parseTrajectory(
        rawData,
        "mmcif",
      );

      const model = await this.plugin.builders.structure.hierarchy.applyPreset(
        trajectory,
        "default",
      );

      if (model?.structure?.cell?.status === "error") {
        throw new Error("Failed to load PDB structure");
      }
    } catch (error) {
      console.log("Error loading PDB:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to load PDB structure",
      );
    }
  }

  async selectSegment(
    entry_id: string,
    segmentId: number,
    segmentationId: string,
    kind: Segment["kind"],
  ) {
    const key = createSegmentKey(segmentId, segmentationId, kind);
    const node = this.getVolsegEntryNode(entry_id);

    if (!node) return;

    await actionSelectSegment(node, key);
  }
}
