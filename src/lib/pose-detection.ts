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

let detector: poseDetection.PoseDetector | null = null;

export async function initMoveNet() {
  await tf.setBackend("webgl");
  await tf.ready();

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    }
  );
  return detector;
}

export async function detectPose(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<poseDetection.Pose[]> {
  if (!detector) {
    await initMoveNet();
  }
  const poses = await detector!.estimatePoses(source);
  return poses;
}

function getKeypointByName(
  keypoints: poseDetection.Keypoint[],
  name: string
): poseDetection.Keypoint | undefined {
  return keypoints.find((kp) => kp.name === name);
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

export function calculateJointAngles(
  keypoints: poseDetection.Keypoint[]
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

  return {
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
}

// Simplified ergonomic scoring based on joint angles
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
  const rebaLegs = scoreFromAngle(180 - Math.min(angles.kneeLeft, angles.kneeRight), [30, 60]);
  const rebaUpperArm = scoreFromAngle(Math.max(angles.upperArmLeft, angles.upperArmRight), [20, 45, 90]);
  const rebaLowerArm = scoreFromAngle(Math.min(angles.lowerArmLeft, angles.lowerArmRight), [60, 100]);
  const rebaWrist = scoreFromAngle(Math.max(angles.wristLeft, angles.wristRight), [15]);
  const rebaScore = Math.min(12, rebaTrunk + rebaNeck + rebaLegs + rebaUpperArm + rebaLowerArm + rebaWrist - 3);

  // OWAS scoring (simplified: 1-4 scale)
  const owasBack = angles.trunk > 40 ? 4 : angles.trunk > 20 ? 3 : angles.trunk > 10 ? 2 : 1;
  const owasArms = Math.max(angles.upperArmLeft, angles.upperArmRight) > 90 ? 3 : Math.max(angles.upperArmLeft, angles.upperArmRight) > 45 ? 2 : 1;
  const owasLegs = Math.min(angles.kneeLeft, angles.kneeRight) < 120 ? 3 : Math.min(angles.kneeLeft, angles.kneeRight) < 150 ? 2 : 1;
  const owasScore = Math.round((owasBack + owasArms + owasLegs) / 3 * 1.3);

  // OCRA scoring (simplified based on repetition proxy)
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

export function drawPose(
  ctx: CanvasRenderingContext2D,
  poses: poseDetection.Pose[],
  width: number,
  height: number
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

    // Draw connections
    ctx.strokeStyle = "hsl(174, 58%, 42%)";
    ctx.lineWidth = 3;
    for (const [a, b] of connections) {
      const kpA = kps.find((k) => k.name === a);
      const kpB = kps.find((k) => k.name === b);
      if (kpA && kpB && (kpA.score ?? 0) > 0.3 && (kpB.score ?? 0) > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kpA.x, kpA.y);
        ctx.lineTo(kpB.x, kpB.y);
        ctx.stroke();
      }
    }

    // Draw keypoints
    for (const kp of kps) {
      if ((kp.score ?? 0) > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "hsl(174, 58%, 52%)";
        ctx.fill();
        ctx.strokeStyle = "hsl(0, 0%, 100%)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
}
