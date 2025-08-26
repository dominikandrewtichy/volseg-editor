import { Button } from "@/components/ui/button";
import { NodeViewWrapper } from "@tiptap/react";

export function Component(props) {
  function increase() {
    props.updateAttributes({
      count: props.node.attrs.count + 1,
    });
  }

  return (
    <NodeViewWrapper
      as="span"
      style={{ display: "inline-flex", verticalAlign: "middle" }}
    >
      <Button
        size="sm"
        onClick={increase}
        style={{ padding: "2px 6px", fontSize: "0.75rem", lineHeight: 1 }}
      >
        {props.node.attrs.count}
      </Button>
    </NodeViewWrapper>
  );
}
