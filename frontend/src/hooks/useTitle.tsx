import { useEffect } from "react";

export const useTitle = (title: string) => {
  const prefix = "CELLIM Viewer | ";

  useEffect(() => {
    const prevTitle = document.title;
    document.title = prefix + title;
    return () => {
      document.title = prevTitle;
    };
  });
};
