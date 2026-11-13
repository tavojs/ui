import { Box, type BoxProps } from "../Box/index.js";
import type { SurfaceTone } from "../types.js";
import { surfaceRadius } from "./Surface.styles.js";

export type SurfaceProps = Omit<BoxProps, "surface"> & {
  tone?: SurfaceTone;
};

export function Surface({ tone = "default", radius, ...props }: SurfaceProps) {
  return <Box surface={tone} radius={surfaceRadius(radius)} {...props} />;
}
