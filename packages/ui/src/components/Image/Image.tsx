import {
  Image as CoreImage,
  type ImageProps as CoreImageProps,
} from "@tavojs/core/runtime";
import styles from "./Image.module.scss";
import { cv, cx, styleObject, sxClassName, type BaseProps } from "@/components/shared";
import { Skeleton } from "@/components/Skeleton";

export type ImageProps = Omit<CoreImageProps, "src" | "alt" | "width" | "height" | "className" | "style"> & BaseProps & {
  src?: string | null;
  alt?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  skeleton?: "text" | "circular" | "rectangular" | "rounded";
  fallback?: string;
};

function isSvgSource(src: string): boolean {
  if (src.startsWith("data:image/svg+xml")) {
    return true;
  }

  const [pathname] = src.split(/[?#]/, 1);
  return pathname.toLowerCase().endsWith(".svg");
}

function hasReservedSize(width: ImageProps["width"], height: ImageProps["height"]): boolean {
  return width !== undefined && height !== undefined;
}

function numericRatio(width: ImageProps["width"], height: ImageProps["height"]): string | undefined {
  if (typeof width !== "number" || typeof height !== "number" || width <= 0 || height <= 0) {
    return undefined;
  }
  return `${width}/${height}`;
}

function cssSize(value: ImageProps["width"]): number | string | undefined {
  return typeof value === "number" ? `${value}px` : value;
}

export function Image({
  className = "",
  src = null,
  alt = "",
  width,
  height,
  objectFit = "cover",
  skeleton,
  fallback,
  style,
  unoptimized,
  ...props
}: ImageProps) {
  const baseStyle = styleObject(style);
  const imageStyle = {
    ...baseStyle,
    ...(typeof width === "string" ? { width } : {}),
    ...(typeof height === "string" ? { height } : {})
  };
  const imageWidth = typeof width === "number" ? width : undefined;
  const imageHeight = typeof height === "number" ? height : undefined;
  const shouldReserveSpace = hasReservedSize(width, height);
  const reservedStyle = shouldReserveSpace
    ? {
        ...baseStyle,
        width: cssSize(width),
        height: cssSize(height),
        aspectRatio: numericRatio(width, height)
      }
    : baseStyle;
  const imageClassName = cx(styles.image, cv(styles, "fit", objectFit, "cover"), className);
  const sxRootClassName = sxClassName(props);

  if (!src && skeleton) {
    return <Skeleton variant={skeleton} width={width} height={height} className={cx(className, sxRootClassName)} />;
  }

  if (!src && fallback) {
    return (
      <div className={cx(styles.fallback, className, sxRootClassName)} style={{ ...baseStyle, width, height }} {...props}>
        {fallback}
      </div>
    );
  }

  if (!src) {
    return (
      <img
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        className={cx(imageClassName, sxRootClassName)}
        style={imageStyle}
        {...props}
      />
    );
  }

  const resolvedUnoptimized = typeof unoptimized === "boolean" ? unoptimized : isSvgSource(src);
  const image = (
    <CoreImage
      src={src}
      alt={alt}
      width={imageWidth}
      height={imageHeight}
      className={cx(imageClassName, shouldReserveSpace && styles.framedImage, !shouldReserveSpace && sxRootClassName)}
      style={shouldReserveSpace ? undefined : imageStyle}
      unoptimized={resolvedUnoptimized}
      {...props}
    />
  );

  if (shouldReserveSpace) {
    return (
      <span className={cx(styles.frame, sxRootClassName)} style={reservedStyle}>
        {image}
      </span>
    );
  }

  return image;
}
