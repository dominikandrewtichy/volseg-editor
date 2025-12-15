import type {
  InternalBoxSegment,
  InternalEllipsoidSegment,
  InternalGeometricSegmentation,
  InternalGridSliceVolume,
  InternalIsosurfaceVolume,
  InternalMeshSegment,
  InternalMeshSegmentation,
  InternalSphereSegment,
  InternalTubeSegment,
  InternalVolumeSegmentation,
} from "@/lib/client";

export type InternalSegmentation =
  | InternalVolumeSegmentation
  | InternalMeshSegmentation
  | InternalGeometricSegmentation;

export type InternalVolume = InternalIsosurfaceVolume | InternalGridSliceVolume;

export type InternalSegment =
  | InternalMeshSegment
  | InternalEllipsoidSegment
  | InternalSphereSegment
  | InternalBoxSegment
  | InternalTubeSegment;
