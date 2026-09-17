import { Euler, Quaternion, Vector3 } from "three";

export type DeviceOrientationStartResult =
  | "started"
  | "denied"
  | "insecure"
  | "unsupported";

export type OrientationView = {
  bearingDegrees: number;
  altitudeDegrees: number;
};

export interface OrientationController {
  start(
    initialView: OrientationView,
    onViewChange: (view: OrientationView) => void,
  ): Promise<DeviceOrientationStartResult>;
  recalibrate(currentView: OrientationView): void;
  stop(): void;
}

type PermissionState = "granted" | "denied";

type DeviceOrientationEventConstructorWithPermission =
  typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<PermissionState>;
  };

type OrientationWindow = Window & {
  DeviceOrientationEvent?: DeviceOrientationEventConstructorWithPermission;
};

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const SMOOTHING_FACTOR = 0.22;
const CAMERA_ALIGNMENT = new Quaternion(
  -Math.sqrt(0.5),
  0,
  0,
  Math.sqrt(0.5),
);
const FORWARD = new Vector3(0, 0, -1);
const SCREEN_AXIS = new Vector3(0, 0, 1);

export class DeviceOrientationController implements OrientationController {
  private referenceOrientation: OrientationView | null = null;
  private baseView: OrientationView = { bearingDegrees: 0, altitudeDegrees: 0 };
  private smoothedView: OrientationView | null = null;
  private latestOrientation: OrientationView | null = null;
  private animationFrame: number | null = null;
  private onViewChange: ((view: OrientationView) => void) | null = null;
  private listening = false;

  async start(
    initialView: OrientationView,
    onViewChange: (view: OrientationView) => void,
  ): Promise<DeviceOrientationStartResult> {
    const orientationWindow = window as OrientationWindow;
    if (!window.isSecureContext) {
      return "insecure";
    }
    const eventConstructor = orientationWindow.DeviceOrientationEvent;
    if (!eventConstructor) {
      return "unsupported";
    }

    if (eventConstructor.requestPermission) {
      try {
        if ((await eventConstructor.requestPermission()) !== "granted") {
          return "denied";
        }
      } catch {
        return "denied";
      }
    }

    this.stop();
    this.baseView = initialView;
    this.onViewChange = onViewChange;
    this.listening = true;
    window.addEventListener("deviceorientation", this.handleOrientation, true);
    return "started";
  }

  recalibrate(currentView: OrientationView): void {
    this.baseView = currentView;
    this.referenceOrientation = null;
    this.smoothedView = currentView;
  }

  stop(): void {
    if (this.listening) {
      window.removeEventListener("deviceorientation", this.handleOrientation, true);
    }
    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
    }
    this.listening = false;
    this.animationFrame = null;
    this.latestOrientation = null;
    this.referenceOrientation = null;
    this.smoothedView = null;
    this.onViewChange = null;
  }

  private readonly handleOrientation = (event: DeviceOrientationEvent) => {
    const orientation = projectDeviceOrientation(
      event.alpha,
      event.beta,
      event.gamma,
      window.screen.orientation?.angle ?? window.orientation ?? 0,
    );
    if (!orientation) {
      return;
    }
    this.latestOrientation = orientation;
    if (this.animationFrame === null) {
      this.animationFrame = window.requestAnimationFrame(this.publishLatestView);
    }
  };

  private readonly publishLatestView = () => {
    this.animationFrame = null;
    const orientation = this.latestOrientation;
    if (!orientation || !this.onViewChange) {
      return;
    }
    if (!this.referenceOrientation) {
      this.referenceOrientation = orientation;
      this.smoothedView = this.baseView;
      this.onViewChange(this.baseView);
      return;
    }

    const target = {
      bearingDegrees: normalizeDegrees(
        this.baseView.bearingDegrees +
          shortestAngleDelta(
            this.referenceOrientation.bearingDegrees,
            orientation.bearingDegrees,
          ),
      ),
      altitudeDegrees: clamp(
        this.baseView.altitudeDegrees +
          orientation.altitudeDegrees -
          this.referenceOrientation.altitudeDegrees,
        0,
        85,
      ),
    };
    const previous = this.smoothedView ?? target;
    const next = {
      bearingDegrees: normalizeDegrees(
        previous.bearingDegrees +
          shortestAngleDelta(previous.bearingDegrees, target.bearingDegrees) *
            SMOOTHING_FACTOR,
      ),
      altitudeDegrees:
        previous.altitudeDegrees +
        (target.altitudeDegrees - previous.altitudeDegrees) * SMOOTHING_FACTOR,
    };
    this.smoothedView = next;
    this.onViewChange(next);
  };
}

export function projectDeviceOrientation(
  alphaDegrees: number | null,
  betaDegrees: number | null,
  gammaDegrees: number | null,
  screenAngleDegrees: number,
): OrientationView | null {
  if (
    alphaDegrees === null ||
    betaDegrees === null ||
    gammaDegrees === null
  ) {
    return null;
  }

  const deviceEuler = new Euler(
    betaDegrees * DEGREES_TO_RADIANS,
    alphaDegrees * DEGREES_TO_RADIANS,
    -gammaDegrees * DEGREES_TO_RADIANS,
    "YXZ",
  );
  const orientation = new Quaternion()
    .setFromEuler(deviceEuler)
    .multiply(CAMERA_ALIGNMENT)
    .multiply(
      new Quaternion().setFromAxisAngle(
        SCREEN_AXIS,
        -screenAngleDegrees * DEGREES_TO_RADIANS,
      ),
    );
  const direction = FORWARD.clone().applyQuaternion(orientation).normalize();

  return {
    bearingDegrees: normalizeDegrees(
      Math.atan2(direction.x, -direction.z) * RADIANS_TO_DEGREES,
    ),
    altitudeDegrees:
      Math.asin(clamp(direction.y, -1, 1)) * RADIANS_TO_DEGREES,
  };
}

function shortestAngleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
