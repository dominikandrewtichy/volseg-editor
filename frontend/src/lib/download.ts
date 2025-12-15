import { toast } from "sonner";
import {
  entriesDownload,
  shareLinksDownload,
  type EntryResponse,
} from "./client";
import { formatBytes } from "./utils";

export function handleOpenInMVS(share_link: string) {
  const storyUrl = `${import.meta.env.VITE_API_URL}/api/v1/share_links/${share_link}/download?format_type=mvstory`;
  const pageUrl = new URL(
    `https://molstar.org/mol-view-stories/builder/?session-url=${encodeURIComponent(storyUrl)}`,
  );
  window.open(pageUrl.toString(), "_blank", "noopener,noreferrer");
}

export async function handleEntriesDownload(
  entry: EntryResponse,
  format_type: "mvsx" | "mvstory",
) {
  const { response, data, error } = await entriesDownload({
    path: { entry_id: entry.id },
    query: {
      format_type: format_type,
    },
    parseAs: "stream",
  });
  if (!data || !response.ok) {
    throw new Error(`Failed to initiate download: ${error}`);
  }

  await handleDownload(response, data, entry.name, format_type);
}
export async function handleShareLinksDownload(
  entry: EntryResponse,
  format_type: "mvsx" | "mvstory",
) {
  const { response, data, error } = await shareLinksDownload({
    path: { share_link_id: entry.share_link.id },
    query: {
      format_type: format_type,
    },
    parseAs: "stream",
  });
  if (!response.ok) {
    throw new Error(`Failed to initiate download: ${error}`);
  }

  await handleDownload(response, data, entry.name, format_type);
}

export async function handleDownload(
  response: Response,
  data: unknown,
  name: string,
  format_type: "mvsx" | "mvstory",
) {
  const toastId = toast.loading("Preparing file...");

  try {
    const reader = (data as ReadableStream<Uint8Array>).getReader();
    const contentLengthHeader = response.headers.get("Content-Length");
    const totalLength = contentLengthHeader
      ? parseInt(contentLengthHeader, 10)
      : null;

    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (totalLength) {
        const progress = Math.round((receivedLength / totalLength) * 100);
        toast.loading(`Downloading file... ${progress}%`, { id: toastId });
      } else {
        toast.loading(`Downloading file... ${formatBytes(receivedLength)}`, {
          id: toastId,
        });
      }
    }

    const blob = new Blob(chunks as BlobPart[]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const baseName = name.endsWith(".cvsx") ? name.slice(0, -5) : name;
    link.setAttribute("download", `${baseName}.${format_type}`);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Download complete", { id: toastId });
  } catch (error) {
    console.error("Download failed", error);
    toast.error("Failed to download file", { id: toastId });
  }
}
