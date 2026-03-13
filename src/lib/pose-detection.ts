import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";

export interface JointAngles {
  neck: number;
  trunk: number;
  upperArmLeft: number;
  upperArmRight: number;
  lowerArmLeft: number;
  lowerArmRight: number;
  wristLeft: number;
  wristRight: number;
  kneeLeft: number;
  kneeRight: number;
}

export interface ErgonomicScores {
  RULA: number;
  REBA: number;
  ROSA: number;
  OWAS: number;
  OCRA: number;
}

// --- Confidence & smoothing config ---
const MIN_CONFIDENCE = 0.35;
const SMOOTHING_WINDOW = 5;

let detector: poseDetection.PoseDetector | null = null;

// Temporal smoothing buffer
const angleHistory: JointAngles[] = [];

export async function initPoseDetector() {
  await tf.setBackend("webgl");
  await tf.ready();

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.BlazePose,
    {
      runtime: "tfjs",
      modelType: "full",
      enableSmoothing: true,
    }
  );
  return detector;
}

export async function detectPose(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<poseDetection.Pose[]> {
  if (!detector) {
    await initPoseDetector();
  }
  const poses = await detector!.estimatePoses(source);
  return poses;
}

function getKeypointByName(
  keypoints: poseDetection.Keypoint[],
  name: string
): poseDetection.Keypoint | undefined {
  const kp = keypoints.find((k) => k.name === name);
  if (kp && (kp.score ?? 0) >= MIN_CONFIDENCE) return kp;
  return undefined;
}

function angleBetweenPoints(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
  if (magAB === 0 || magCB === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function smoothAngles(current: JointAngles): JointAngles {
  angleHistory.push(current);
  if (angleHistory.length > SMOOTHING_WINDOW) {
    angleHistory.shift();
  }
  const keys = Object.keys(current) as (keyof JointAngles)[];
  const smoothed = {} as JointAngles;
  for (const key of keys) {
    const sum = angleHistory.reduce((acc, h) => acc + h[key], 0);
    smoothed[key] = sum / angleHistory.length;
  }
  return smoothed;
}

export function resetSmoothing() {
  angleHistory.length = 0;
}

export function calculateJointAngles(
  keypoints: poseDetection.Keypoint[],
  applySmoothing = true
): JointAngles {
  const nose = getKeypointByName(keypoints, "nose");
  const lShoulder = getKeypointByName(keypoints, "left_shoulder");
  const rShoulder = getKeypointByName(keypoints, "right_shoulder");
  const lElbow = getKeypointByName(keypoints, "left_elbow");
  const rElbow = getKeypointByName(keypoints, "right_elbow");
  const lWrist = getKeypointByName(keypoints, "left_wrist");
  const rWrist = getKeypointByName(keypoints, "right_wrist");
  const lHip = getKeypointByName(keypoints, "left_hip");
  const rHip = getKeypointByName(keypoints, "right_hip");
  const lKnee = getKeypointByName(keypoints, "left_knee");
  const rKnee = getKeypointByName(keypoints, "right_knee");
  const lAnkle = getKeypointByName(keypoints, "left_ankle");
  const rAnkle = getKeypointByName(keypoints, "right_ankle");

  const midShoulder = lShoulder && rShoulder
    ? { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 }
    : lShoulder || rShoulder || { x: 0, y: 0 };

  const midHip = lHip && rHip
    ? { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 }
    : lHip || rHip || { x: 0, y: 0 };

  const neckAngle = nose && midShoulder && midHip
    ? 180 - angleBetweenPoints(nose, midShoulder, midHip)
    : 0;

  const trunkAngle = midShoulder && midHip
    ? Math.abs(Math.atan2(midShoulder.x - midHip.x, midHip.y - midShoulder.y) * 180 / Math.PI)
    : 0;

  const upperArmLeft = lShoulder && lElbow && lHip
    ? angleBetweenPoints(lHip, lShoulder, lElbow)
    : 0;

  const upperArmRight = rShoulder && rElbow && rHip
    ? angleBetweenPoints(rHip, rShoulder, rElbow)
    : 0;

  const lowerArmLeft = lShoulder && lElbow && lWrist
    ? angleBetweenPoints(lShoulder, lElbow, lWrist)
    : 180;

  const lowerArmRight = rShoulder && rElbow && rWrist
    ? angleBetweenPoints(rShoulder, rElbow, rWrist)
    : 180;

  const wristLeft = lElbow && lWrist
    ? Math.abs(180 - (lowerArmLeft || 180))
    : 0;

  const wristRight = rElbow && rWrist
    ? Math.abs(180 - (lowerArmRight || 180))
    : 0;

  const kneeLeft = lHip && lKnee && lAnkle
    ? angleBetweenPoints(lHip, lKnee, lAnkle)
    : 180;

  const kneeRight = rHip && rKnee && rAnkle
    ? angleBetweenPoints(rHip, rKnee, rAnkle)
    : 180;

  const raw: JointAngles = {
    neck: neckAngle,
    trunk: trunkAngle,
    upperArmLeft,
    upperArmRight,
    lowerArmLeft,
    lowerArmRight,
    wristLeft,
    wristRight,
    kneeLeft,
    kneeRight,
  };

  return applySmoothing ? smoothAngles(raw) : raw;
}

// --- Knee risk classification ---
export type KneeRiskLevel = "neutral" | "low" | "moderate" | "high";

export function classifyKneeRisk(kneeAngle: number): KneeRiskLevel {
  if (kneeAngle >= 160) return "neutral";   // 160-180°
  if (kneeAngle >= 140) return "low";       // 140-160°
  if (kneeAngle >= 110) return "moderate";  // 110-140°
  return "high";                            // < 110°
}

// --- Ergonomic scoring ---
function scoreFromAngle(angle: number, thresholds: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (angle <= thresholds[i]) return i + 1;
  }
  return thresholds.length + 1;
}

export function calculateErgonomicScores(angles: JointAngles): ErgonomicScores {
  // RULA scoring (simplified)
  const rulaUpperArm = scoreFromAngle(Math.max(angles.upperArmLeft, angles.upperArmRight), [20, 45, 90]);
  const rulaLowerArm = scoreFromAngle(Math.min(angles.lowerArmLeft, angles.lowerArmRight), [60, 100]);
  const rulaWrist = scoreFromAngle(Math.max(angles.wristLeft, angles.wristRight), [15, 30]);
  const rulaNeck = scoreFromAngle(angles.neck, [10, 20]);
  const rulaTrunk = scoreFromAngle(angles.trunk, [10, 20, 60]);
  const rulaScore = Math.min(7, Math.round((rulaUpperArm + rulaLowerArm + rulaWrist + rulaNeck + rulaTrunk) / 5 * 2.5));

  // REBA scoring (simplified)
  const rebaTrunk = scoreFromAngle(angles.trunk, [5, 20, 60]);
  const rebaNeck = scoreFromAngle(angles.neck, [20]);
  // Corrected knee/leg scoring using classifyKneeRisk
  const minKnee = Math.min(angles.kneeLeft, angles.kneeRight);
  const kneeRisk = classifyKneeRisk(minKnee);
  const rebaLegs = kneeRisk === "neutral" ? 1 : kneeRisk === "low" ? 2 : kneeRisk === "moderate" ? 3 : 4;
  const rebaUpperArm = scoreFromAngle(Math.max(angles.upperArmLeft, angles.upperArmRight), [20, 45, 90]);
  const rebaLowerArm = scoreFromAngle(Math.min(angles.lowerArmLeft, angles.lowerArmRight), [60, 100]);
  const rebaWrist = scoreFromAngle(Math.max(angles.wristLeft, angles.wristRight), [15]);
  const rebaScore = Math.min(12, rebaTrunk + rebaNeck + rebaLegs + rebaUpperArm + rebaLowerArm + rebaWrist - 3);

  // OWAS scoring (simplified: 1-4 scale)
  const owasBack = angles.trunk > 40 ? 4 : angles.trunk > 20 ? 3 : angles.trunk > 10 ? 2 : 1;
  const owasArms = Math.max(angles.upperArmLeft, angles.upperArmRight) > 90 ? 3 : Math.max(angles.upperArmLeft, angles.upperArmRight) > 45 ? 2 : 1;
  // Corrected leg scoring for OWAS
  const owasLegs = kneeRisk === "high" ? 4 : kneeRisk === "moderate" ? 3 : kneeRisk === "low" ? 2 : 1;
  const owasScore = Math.round((owasBack + owasArms + owasLegs) / 3 * 1.3);

  // OCRA scoring (simplified)
  const ocraScore = Math.min(10, Math.round(
    (scoreFromAngle(angles.trunk, [10, 20, 40]) +
      scoreFromAngle(Math.max(angles.upperArmLeft, angles.upperArmRight), [20, 45, 90]) +
      scoreFromAngle(Math.max(angles.wristLeft, angles.wristRight), [15, 30])) * 1.1
  ));

  // ROSA scoring (for office - simplified)
  const rosaScore = Math.min(10, Math.round(
    (scoreFromAngle(angles.trunk, [10, 20]) +
      scoreFromAngle(angles.neck, [10, 20]) +
      scoreFromAngle(Math.max(angles.wristLeft, angles.wristRight), [15, 30])) * 1.2
  ));

  return {
    RULA: Math.max(1, rulaScore),
    REBA: Math.max(1, rebaScore),
    ROSA: Math.max(1, rosaScore),
    OWAS: Math.max(1, owasScore),
    OCRA: Math.max(1, ocraScore),
  };
}

// --- Risk color helpers ---
type RiskLevel = "safe" | "moderate" | "high" | "critical";

function getRiskLevel(angle: number, thresholds: [number, number, number]): RiskLevel {
  if (angle <= thresholds[0]) return "safe";
  if (angle <= thresholds[1]) return "moderate";
  if (angle <= thresholds[2]) return "high";
  return "critical";
}

function getKneeRiskLevel(kneeAngle: number): RiskLevel {
  if (kneeAngle >= 160) return "safe";
  if (kneeAngle >= 140) return "moderate";
  if (kneeAngle >= 110) return "high";
  return "critical";
}

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: "hsl(142, 71%, 45%)",      // green
  moderate: "hsl(48, 96%, 53%)",   // yellow
  high: "hsl(25, 95%, 53%)",       // orange
  critical: "hsl(0, 84%, 60%)",    // red
};

const RISK_KEYPOINT_COLORS: Record<RiskLevel, string> = {
  safe: "hsl(142, 71%, 55%)",
  moderate: "hsl(48, 96%, 63%)",
  high: "hsl(25, 95%, 63%)",
  critical: "hsl(0, 84%, 70%)",
};

function getSegmentRisk(a: string, b: string, angles: JointAngles | null): RiskLevel {
  if (!angles) return "safe";
  // Trunk segments
  if ((a === "left_shoulder" && b === "left_hip") || (a === "right_shoulder" && b === "right_hip")) {
    return getRiskLevel(angles.trunk, [10, 20, 40]);
  }
  // Upper arm
  if (a === "left_shoulder" && b === "left_elbow") return getRiskLevel(angles.upperArmLeft, [20, 45, 90]);
  if (a === "right_shoulder" && b === "right_elbow") return getRiskLevel(angles.upperArmRight, [20, 45, 90]);
  // Lower arm
  if (a === "left_elbow" && b === "left_wrist") return getRiskLevel(Math.abs(180 - angles.lowerArmLeft), [20, 40, 60]);
  if (a === "right_elbow" && b === "right_wrist") return getRiskLevel(Math.abs(180 - angles.lowerArmRight), [20, 40, 60]);
  // Knee/leg
  if (a === "left_hip" && b === "left_knee") return getKneeRiskLevel(angles.kneeLeft);
  if (a === "left_knee" && b === "left_ankle") return getKneeRiskLevel(angles.kneeLeft);
  if (a === "right_hip" && b === "right_knee") return getKneeRiskLevel(angles.kneeRight);
  if (a === "right_knee" && b === "right_ankle") return getKneeRiskLevel(angles.kneeRight);
  // Shoulder bridge and head
  return "safe";
}

function getKeypointRisk(name: string, angles: JointAngles | null): RiskLevel {
  if (!angles) return "safe";
  if (name === "nose") return getRiskLevel(angles.neck, [10, 20, 40]);
  if (name === "left_shoulder" || name === "right_shoulder") return getRiskLevel(angles.trunk, [10, 20, 40]);
  if (name === "left_elbow") return getRiskLevel(angles.upperArmLeft, [20, 45, 90]);
  if (name === "right_elbow") return getRiskLevel(angles.upperArmRight, [20, 45, 90]);
  if (name === "left_wrist") return getRiskLevel(angles.wristLeft, [15, 30, 50]);
  if (name === "right_wrist") return getRiskLevel(angles.wristRight, [15, 30, 50]);
  if (name === "left_hip" || name === "right_hip") return getRiskLevel(angles.trunk, [10, 20, 40]);
  if (name === "left_knee") return getKneeRiskLevel(angles.kneeLeft);
  if (name === "right_knee") return getKneeRiskLevel(angles.kneeRight);
  if (name === "left_ankle") return getKneeRiskLevel(angles.kneeLeft);
  if (name === "right_ankle") return getKneeRiskLevel(angles.kneeRight);
  return "safe";
}

// --- Drawing ---
export function drawPose(
  ctx: CanvasRenderingContext2D,
  poses: poseDetection.Pose[],
  width: number,
  height: number,
  angles?: JointAngles | null
) {
  const connections: [string, string][] = [
    ["nose", "left_eye"], ["nose", "right_eye"],
    ["left_eye", "left_ear"], ["right_eye", "right_ear"],
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"], ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"], ["right_elbow", "right_wrist"],
    ["left_shoulder", "left_hip"], ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"], ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"], ["right_knee", "right_ankle"],
  ];

  for (const pose of poses) {
    const kps = pose.keypoints;

    // Draw connections with risk colors
    ctx.lineWidth = 6;
    for (const [a, b] of connections) {
      const kpA = kps.find((k) => k.name === a);
      const kpB = kps.find((k) => k.name === b);
      if (kpA && kpB && (kpA.score ?? 0) > MIN_CONFIDENCE && (kpB.score ?? 0) > MIN_CONFIDENCE) {
        const risk = getSegmentRisk(a, b, angles ?? null);
        ctx.strokeStyle = RISK_COLORS[risk];
        // Glow effect
        ctx.shadowColor = RISK_COLORS[risk];
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(kpA.x, kpA.y);
        ctx.lineTo(kpB.x, kpB.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Draw keypoints with risk colors
    for (const kp of kps) {
      if ((kp.score ?? 0) > MIN_CONFIDENCE && kp.name) {
        const risk = getKeypointRisk(kp.name, angles ?? null);
        // Outer glow
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = RISK_KEYPOINT_COLORS[risk];
        ctx.globalAlpha = 0.4;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        // Inner dot
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = RISK_KEYPOINT_COLORS[risk];
        ctx.fill();
        ctx.strokeStyle = "hsla(0, 0%, 100%, 0.95)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }
  }
}
