import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Play, Square, RotateCcw, Save, Loader2, Eye } from "lucide-react";
import { mockSectors, mockWorkstations } from "@/lib/mock-data";
import { CompanySelector } from "@/components/CompanySelector";
import {
  detectPose,
  calculateJointAngles,
  calculateErgonomicScores,
  drawPose,
  initPoseDetector,
  type JointAngles,
  type ErgonomicScores,
} from "@/lib/pose-detection";
import { toast } from "sonner";

type AnalysisStep = "upload" | "detecting" | "results" | "details" | "saved";

export default function AnaliseCameraPage() {
  const [step, setStep] = useState<AnalysisStep>("upload");
  const [sourceType, setSourceType] = useState<"camera" | "file">("file");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [scores, setScores] = useState<ErgonomicScores | null>(null);
  const [angles, setAngles] = useState<JointAngles | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [sectorId, setSectorId] = useState("");
  const [activity, setActivity] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStreamingRef = useRef(false);
  const anglesRef = useRef<JointAngles | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const loadModel = async () => {
    setIsModelLoading(true);
    try {
      await initPoseDetector();
      toast.success("Modelo BlazePose carregado com sucesso!");
    } catch (err) {
      toast.error("Erro ao carregar modelo de IA. Verifique sua conexão.");
      console.error(err);
    } finally {
      setIsModelLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      await loadModel();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        isStreamingRef.current = true;
        setSourceType("camera");
        runDetectionLoop();
      }
    } catch (err) {
      toast.error("Erro ao acessar câmera. Verifique as permissões.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    isStreamingRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const runDetectionLoop = () => {
    const detect = async () => {
      if (!isStreamingRef.current || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      try {
        const poses = await detectPose(video);
        if (poses.length > 0) {
          const jointAngles = calculateJointAngles(poses[0].keypoints);
          const ergScores = calculateErgonomicScores(jointAngles);
          anglesRef.current = jointAngles;

          // Re-draw video frame then overlay skeleton with risk colors
          ctx.drawImage(video, 0, 0);
          drawPose(ctx, poses, canvas.width, canvas.height, jointAngles);

          setAngles(jointAngles);
          setScores(ergScores);
        }
      } catch (err) {
        console.error("Detection error:", err);
      }

      if (isStreamingRef.current) {
        animFrameRef.current = requestAnimationFrame(detect);
      }
    };
    animFrameRef.current = requestAnimationFrame(detect);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("detecting");
    await loadModel();

    if (file.type.startsWith("image/")) {
      const img = new Image();
      img.onload = async () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const poses = await detectPose(img);
          if (poses.length > 0) {
            drawPose(ctx, poses, canvas.width, canvas.height);
            const jointAngles = calculateJointAngles(poses[0].keypoints);
            const ergScores = calculateErgonomicScores(jointAngles);
            setAngles(jointAngles);
            setScores(ergScores);
            setStep("results");
            toast.success("Postura detectada com sucesso!");
          } else {
            toast.error("Nenhuma postura detectada. Tente outra imagem.");
            setStep("upload");
          }
        } catch (err) {
          toast.error("Erro na detecção. Tente novamente.");
          setStep("upload");
          console.error(err);
        }
      };
      img.src = URL.createObjectURL(file);
      if (imageRef.current) imageRef.current.src = img.src;
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.onloadeddata = async () => {
        video.currentTime = 1; // capture at 1 second
      };
      video.onseeked = async () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d")!;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        try {
          const poses = await detectPose(canvas);
          if (poses.length > 0) {
            drawPose(ctx, poses, canvas.width, canvas.height);
            const jointAngles = calculateJointAngles(poses[0].keypoints);
            const ergScores = calculateErgonomicScores(jointAngles);
            setAngles(jointAngles);
            setScores(ergScores);
            setStep("results");
            toast.success("Postura detectada no vídeo!");
          } else {
            toast.error("Nenhuma postura detectada no vídeo.");
            setStep("upload");
          }
        } catch (err) {
          toast.error("Erro na detecção do vídeo.");
          setStep("upload");
          console.error(err);
        }
      };
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    stopCamera();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
      const poses = await detectPose(canvas);
      if (poses.length > 0) {
        drawPose(ctx, poses, canvas.width, canvas.height);
        const jointAngles = calculateJointAngles(poses[0].keypoints);
        const ergScores = calculateErgonomicScores(jointAngles);
        setAngles(jointAngles);
        setScores(ergScores);
        setStep("results");
        toast.success("Frame capturado e analisado!");
      }
    } catch (err) {
      toast.error("Erro ao capturar frame.");
      console.error(err);
    }
  };

  const handleSave = () => {
    if (!sectorId || !activity || !role || !selectedMethod) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    toast.success("Análise salva com sucesso!");
    setStep("saved");
  };

  const reset = () => {
    stopCamera();
    setStep("upload");
    setScores(null);
    setAngles(null);
    setSelectedMethod("");
    setSectorId("");
    setActivity("");
    setRole("");
    setNotes("");
  };

  const getRiskColor = (score: number, method: string) => {
    const thresholds: Record<string, number[]> = {
      RULA: [2, 4, 6],
      REBA: [3, 5, 8],
      ROSA: [3, 5, 7],
      OWAS: [1, 2, 3],
      OCRA: [3, 5, 7],
    };
    const t = thresholds[method] || [3, 5, 7];
    if (score <= t[0]) return "bg-success text-success-foreground";
    if (score <= t[1]) return "bg-warning text-warning-foreground";
    if (score <= t[2]) return "bg-high text-high-foreground";
    return "bg-critical text-critical-foreground";
  };

  const getRiskLabel = (score: number, method: string) => {
    const thresholds: Record<string, number[]> = {
      RULA: [2, 4, 6],
      REBA: [3, 5, 8],
      ROSA: [3, 5, 7],
      OWAS: [1, 2, 3],
      OCRA: [3, 5, 7],
    };
    const t = thresholds[method] || [3, 5, 7];
    if (score <= t[0]) return "Baixo";
    if (score <= t[1]) return "Médio";
    if (score <= t[2]) return "Alto";
    return "Crítico";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Análise por Câmera / Imagem</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Detecção automática de postura com BlazePose — Tempo Real
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompanySelector />
          {step !== "upload" && (
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-1" /> Nova Análise
            </Button>
          )}
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 sm:gap-2 text-sm overflow-x-auto">
        {["Upload", "Detecção", "Resultados", "Detalhes", "Salvo"].map((label, i) => {
          const steps: AnalysisStep[] = ["upload", "detecting", "results", "details", "saved"];
          const isActive = steps.indexOf(step) >= i;
          return (
            <div key={label} className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold ${isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {i + 1}
              </div>
              <span className={`text-[10px] sm:text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
              {i < 4 && <div className={`w-4 sm:w-8 h-0.5 ${isActive ? "bg-accent" : "bg-muted"}`} />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Camera/Upload area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fonte da Imagem</CardTitle>
            <CardDescription>Use a câmera ou envie uma foto/vídeo do posto de trabalho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "upload" && !isStreaming && (
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file" className="text-xs sm:text-sm">
                    <Upload className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Arquivo</span><span className="sm:hidden">Arquivo</span>
                  </TabsTrigger>
                  <TabsTrigger value="camera" className="text-xs sm:text-sm">
                    <Camera className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Câmera</span><span className="sm:hidden">Câmera</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="file" className="space-y-4">
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium">Clique para enviar</p>
                    <p className="text-sm text-muted-foreground mt-1">Fotos (JPG, PNG) ou Vídeos (MP4, WebM)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </TabsContent>
                <TabsContent value="camera" className="space-y-4">
                  <Button onClick={startCamera} className="w-full" disabled={isModelLoading}>
                    {isModelLoading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando modelo...</>
                    ) : (
                      <><Camera className="h-4 w-4 mr-2" /> Iniciar Câmera</>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            )}

            {step === "detecting" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-accent" />
                <p className="font-medium">Analisando postura...</p>
                <p className="text-sm text-muted-foreground">Detectando articulações e calculando ângulos</p>
              </div>
            )}

            {/* Video + Canvas overlay for camera */}
            <div className={isStreaming ? "relative w-full" : "hidden"}>
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              />
            </div>

            {/* Canvas for file-based detection (no video) */}
            {!isStreaming && step !== "upload" && (
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border border-border"
              />
            )}

            <img ref={imageRef} className="hidden" alt="" />

            {isStreaming && (
              <div className="flex gap-2">
                <Button onClick={captureFrame} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" /> Capturar e Analisar
                </Button>
                <Button variant="destructive" onClick={stopCamera}>
                  <Square className="h-4 w-4 mr-2" /> Parar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Results / Details */}
        <div className="space-y-6">
          {/* Live scores when streaming */}
          {isStreaming && scores && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pontuação em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(scores).map(([method, score]) => (
                    <div key={method} className="text-center">
                      <Badge className={`${getRiskColor(score, method)} mb-1`}>{score}</Badge>
                      <p className="text-xs font-medium">{method}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results after detection */}
          {(step === "results" || step === "details" || step === "saved") && scores && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados Ergonômicos</CardTitle>
                <CardDescription>Pontuação calculada automaticamente por método</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(scores).map(([method, score]) => (
                    <div
                      key={method}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedMethod === method ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"}`}
                      onClick={() => setSelectedMethod(method)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">{method}</Badge>
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <span className="font-bold text-lg">{score}</span>
                      </div>
                      <Badge className={getRiskColor(score, method)}>
                        {getRiskLabel(score, method)}
                      </Badge>
                    </div>
                  ))}
                </div>

                {angles && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Ângulos Articulares Detectados</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Pescoço</span><span className="font-mono">{angles.neck.toFixed(1)}°</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tronco</span><span className="font-mono">{angles.trunk.toFixed(1)}°</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Braço Esq.</span><span className="font-mono">{angles.upperArmLeft.toFixed(1)}°</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Braço Dir.</span><span className="font-mono">{angles.upperArmRight.toFixed(1)}°</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Antebraço Esq.</span><span className="font-mono">{angles.lowerArmLeft.toFixed(1)}°</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Antebraço Dir.</span><span className="font-mono">{angles.lowerArmRight.toFixed(1)}°</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Punho Esq.</span><span className="font-mono">{angles.wristLeft.toFixed(1)}°</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Punho Dir.</span><span className="font-mono">{angles.wristRight.toFixed(1)}°</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Joelho Esq.</span><span className="font-mono">{angles.kneeLeft.toFixed(1)}°</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Joelho Dir.</span><span className="font-mono">{angles.kneeRight.toFixed(1)}°</span></div>
                    </div>
                  </div>
                )}

                {step === "results" && (
                  <Button onClick={() => setStep("details")} className="w-full mt-4">
                    Preencher Informações da Análise
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Details form */}
          {(step === "details") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações da Análise</CardTitle>
                <CardDescription>Preencha os dados para gerar a AEP/AET</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Método Selecionado</label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger><SelectValue placeholder="Selecione o método" /></SelectTrigger>
                    <SelectContent>
                      {["RULA", "REBA", "ROSA", "OWAS", "OCRA"].map((m) => (
                        <SelectItem key={m} value={m}>{m} — Score: {scores?.[m as keyof ErgonomicScores]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Setor</label>
                  <Select value={sectorId} onValueChange={setSectorId}>
                    <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                    <SelectContent>
                      {mockSectors.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Atividade</label>
                  <Input placeholder="Descrição da atividade" value={activity} onChange={(e) => setActivity(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cargo</label>
                  <Input placeholder="Cargo do trabalhador" value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Observações</label>
                  <Textarea placeholder="Informações adicionais para AEP/AET..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <Button onClick={handleSave} className="w-full">
                  <Save className="h-4 w-4 mr-2" /> Salvar Análise
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "saved" && (
            <Card className="border-accent">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Save className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Análise Salva!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Método {selectedMethod} — Score {scores?.[selectedMethod as keyof ErgonomicScores]} — {getRiskLabel(scores?.[selectedMethod as keyof ErgonomicScores] || 0, selectedMethod)}
                </p>
                <Button onClick={reset} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" /> Nova Análise
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
