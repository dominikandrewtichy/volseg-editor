import { useEffect } from "react";

export function useTitle(title: string) {
  const prefix = "VolSeg Editor | ";

  useEffect(() => {
    const prevTitle = document.title;
    document.title = prefix + title;
    return () => {
      document.title = prevTitle;
    };
  });
}
