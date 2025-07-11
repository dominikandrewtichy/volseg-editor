import { useBehavior } from "@/hooks/useBehavior";
import { MolstarViewerModel } from "@/lib/models/molstar-viewer";
import { LeftPanelControls } from "molstar/lib/commonjs/mol-plugin-ui/left-panel";
import {
  ControlsWrapper,
  DefaultViewport,
  PluginContextContainer,
} from "molstar/lib/commonjs/mol-plugin-ui/plugin";
import { SequenceView } from "molstar/lib/commonjs/mol-plugin-ui/sequence";
import { useEffect } from "react";

export function ViewerLayout({ viewer }: { viewer: MolstarViewerModel }) {
  const showControls = useBehavior(viewer.state.showControls);
  const isExpanded = useBehavior(viewer.state.isExpanded);
  const showSequenceView = useBehavior(viewer.state.showSequenceView);

  useEffect(() => {
    viewer.mount();
    return () => viewer.dispose();
  }, [viewer]);

  return (
    <div
      style={{
        position: isExpanded ? "fixed" : "relative",
        inset: isExpanded ? 0 : "auto",
        width: "100%",
        height: "100%",
        zIndex: isExpanded ? 51 : "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          width: "100%",
        }}
      >
        {showControls && (
          <div
            style={{
              position: "relative",
              maxWidth: "330px",
              height: "100%",
              flex: 1,
            }}
          >
            <MolstarLeftPanelControlsView viewer={viewer} />
          </div>
        )}

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: "100%",
            width: "100%",
          }}
        >
          {showSequenceView && (
            <div
              style={{
                position: "relative",
                height: isExpanded ? "100px" : "80px",
                width: "100%",
              }}
            >
              <MolstarSequence viewer={viewer} />
            </div>
          )}
          <div style={{ position: "relative", flex: 1 }}>
            <MolstarViewport viewer={viewer} />
          </div>
        </div>

        {showControls && (
          <div
            style={{
              position: "relative",
              maxWidth: "300px",
              height: "100%",
              flex: 1,
            }}
          >
            <MolstarControlsView viewer={viewer} />
          </div>
        )}
      </div>
    </div>
  );
}

export function MolstarViewport({ viewer }: { viewer: MolstarViewerModel }) {
  const ViewportViewer =
    viewer.plugin.spec.components?.viewport?.view || DefaultViewport;

  return (
    <PluginContextContainer plugin={viewer.plugin}>
      <ViewportViewer />
    </PluginContextContainer>
  );
}

export function MolstarSequence({ viewer }: { viewer: MolstarViewerModel }) {
  const SequenceViewer =
    viewer.plugin.spec.components?.sequenceViewer?.view || SequenceView;

  return (
    <PluginContextContainer plugin={viewer.plugin}>
      <SequenceViewer />
    </PluginContextContainer>
  );
}

export function MolstarLeftPanelControlsView({
  viewer,
}: {
  viewer: MolstarViewerModel;
}) {
  return (
    <PluginContextContainer plugin={viewer.plugin}>
      <LeftPanelControls />
    </PluginContextContainer>
  );
}

export function MolstarControlsView({
  viewer,
}: {
  viewer: MolstarViewerModel;
}) {
  return (
    <PluginContextContainer plugin={viewer.plugin}>
      <ControlsWrapper />
    </PluginContextContainer>
  );
}
