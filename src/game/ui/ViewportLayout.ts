export type GameRole = "worm" | "hunter";
export type ViewportOrientation = "landscape" | "portrait";

export interface SafeAreaInsets {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface ViewportLayoutInput {
  readonly leftHanded?: boolean;
  readonly cssWidth: number;
  readonly cssHeight: number;
  readonly devicePixelRatio: number;
  readonly safeArea: SafeAreaInsets;
  readonly orientation: ViewportOrientation;
  readonly coarsePointer: boolean;
  readonly touchCapable: boolean;
  readonly role: GameRole;
}

export interface LayoutRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ViewportLayoutResult {
  readonly gameRect: LayoutRect;
  readonly canvasPixels: Readonly<{ width: number; height: number }>;
  readonly criticalRegion: LayoutRect;
  readonly joystick: LayoutRect;
  readonly primaryButton: LayoutRect;
  readonly boostButton: LayoutRect;
  readonly targetSize: number;
  readonly portraitBlocked: boolean;
  readonly touchControlsVisible: boolean;
}

export function computeViewportLayout(
  input: ViewportLayoutInput,
): ViewportLayoutResult {
  validateInput(input);
  const safeWidth =
    input.cssWidth - input.safeArea.left - input.safeArea.right;
  const safeHeight =
    input.cssHeight - input.safeArea.top - input.safeArea.bottom;
  if (safeWidth <= 0 || safeHeight <= 0) {
    throw new RangeError("Safe area must leave a positive game rectangle.");
  }

  const gameRect = rect(
    input.safeArea.left,
    input.safeArea.top,
    safeWidth,
    safeHeight,
  );
  const targetSize = clamp(safeHeight * 0.14, 44, 72);
  const joystickSize = targetSize * 2;
  const primarySize = targetSize * 1.2;
  const gameRight = gameRect.x + gameRect.width;
  const gameBottom = gameRect.y + gameRect.height;
  const edgeGap = targetSize * 0.34;

  const joystick = rect(
    gameRect.x + targetSize * 0.5,
    gameBottom - joystickSize - edgeGap,
    joystickSize,
    joystickSize,
  );
  const primaryButton = rect(
    gameRight - primarySize - edgeGap,
    gameBottom - primarySize - edgeGap,
    primarySize,
    primarySize,
  );
  const boostButton = rect(
    primaryButton.x - targetSize * 1.15,
    primaryButton.y - targetSize * 0.35,
    targetSize,
    targetSize,
  );
  const criticalRegion = rect(
    gameRect.x + gameRect.width * 0.28,
    gameRect.y + gameRect.height * 0.12,
    gameRect.width * 0.44,
    gameRect.height * 0.6,
  );
  const portraitBlocked =
    input.orientation === "portrait" || input.cssHeight > input.cssWidth;
  const touchControlsVisible =
    !portraitBlocked && (input.touchCapable || input.coarsePointer);

  return Object.freeze({
    gameRect,
    canvasPixels: Object.freeze({
      width: Math.round(input.cssWidth * input.devicePixelRatio),
      height: Math.round(input.cssHeight * input.devicePixelRatio),
    }),
    criticalRegion,
    joystick: input.leftHanded ? mirror(joystick, gameRect) : joystick,
    primaryButton: input.leftHanded ? mirror(primaryButton, gameRect) : primaryButton,
    boostButton: input.leftHanded ? mirror(boostButton, gameRect) : boostButton,
    targetSize,
    portraitBlocked,
    touchControlsVisible,
  });
}

function mirror(value: LayoutRect, area: LayoutRect): LayoutRect { return rect(area.x + area.width - (value.x - area.x) - value.width, value.y, value.width, value.height); }

function validateInput(input: ViewportLayoutInput): void {
  const values = [
    input.cssWidth,
    input.cssHeight,
    input.devicePixelRatio,
    input.safeArea.top,
    input.safeArea.right,
    input.safeArea.bottom,
    input.safeArea.left,
  ];
  if (
    values.some((value) => !Number.isFinite(value)) ||
    input.cssWidth <= 0 ||
    input.cssHeight <= 0 ||
    input.devicePixelRatio <= 0 ||
    input.safeArea.top < 0 ||
    input.safeArea.right < 0 ||
    input.safeArea.bottom < 0 ||
    input.safeArea.left < 0
  ) {
    throw new RangeError("Viewport measurements must be finite and non-negative.");
  }
}

function rect(
  x: number,
  y: number,
  width: number,
  height: number,
): LayoutRect {
  return Object.freeze({ x, y, width, height });
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
