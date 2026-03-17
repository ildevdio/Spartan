import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import { MIN_PHOTOS_REQUIRED, type PosturePhoto } from "@/lib/types";
import { Plus, Camera, Upload, CheckCircle2, AlertTriangle, Image, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PostureCapturePage() {
  const {
    companyWorkstations, companySectors,
    posturePhotos, addPosturePhoto, deletePosturePhoto,
    workstations,
  } = useCompany();
  const [open, setOpen] = useState(false);
  const [wsId, setWsId] = useState("");
  const [postureType, setPostureType] = useState("");
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!wsId || !postureType.trim()) {
      toast.error("Selecione o posto e o tipo de postura.");
      return;
    }
    await addPosturePhoto({
      workstation_id: wsId,
      image_url: previewUrl || "/placeholder.svg",
      posture_type: postureType,
      notes,
      timestamp: new Date().toISOString(),
    });
    toast.success("Foto de postura registrada!");
    setOpen(false);
    setWsId("");
    setPostureType("");
    setNotes("");
    setPreviewUrl(null);
  };

  const getPhotosForWs = (wsId: string) => posturePhotos.filter((p) => p.workstation_id === wsId);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Captura de Posturas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Mínimo de {MIN_PHOTOS_REQUIRED} fotos por posto.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompanySelector />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Foto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader><DialogTitle>Registrar Foto de Postura</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Select value={wsId} onValueChange={setWsId}>
                  <SelectTrigger><SelectValue placeholder="Selecione o posto de trabalho" /></SelectTrigger>
                  <SelectContent>
                    {companyWorkstations.map((w) => {
                      const sector = companySectors.find((s) => s.id === w.sector_id);
                      return (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name} {sector ? `(${sector.name})` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Tipo de postura (ex: Flexão de tronco)"
                  value={postureType}
                  onChange={(e) => setPostureType(e.target.value)}
                />
                <Input
                  placeholder="Observações"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="mx-auto max-h-40 rounded max-w-full" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Clique para enviar foto</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <Button onClick={handleSave} className="w-full">Registrar Foto</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress per workstation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyWorkstations.map((ws) => {
          const photos = getPhotosForWs(ws.id);
          const count = photos.length;
          const progress = Math.min((count / MIN_PHOTOS_REQUIRED) * 100, 100);
          const isComplete = count >= MIN_PHOTOS_REQUIRED;
          const sector = companySectors.find((s) => s.id === ws.sector_id);

          return (
            <Card key={ws.id} className={isComplete ? "border-success/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    )}
                    <CardTitle className="text-sm truncate">{ws.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{sector?.name}</Badge>
                </div>
                <CardDescription className="text-xs truncate">{ws.tasks_performed}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">Fotos:</span>
                  <span className="font-bold text-xs">{count} / {MIN_PHOTOS_REQUIRED}</span>
                </div>
                <Progress value={progress} className="h-2" />
                {!isComplete && (
                  <p className="text-xs text-warning font-medium">
                    Faltam {MIN_PHOTOS_REQUIRED - count} foto(s)
                  </p>
                )}
                {isComplete && (
                  <p className="text-xs text-success font-medium">
                    ✓ Mínimo atingido
                  </p>
                )}

                {photos.length > 0 && (
                  <div className="grid grid-cols-5 gap-1 pt-2">
                    {photos.slice(0, 5).map((photo) => (
                      <div key={photo.id} className="aspect-square rounded bg-muted flex items-center justify-center overflow-hidden">
                        <Image className="h-3 w-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {photos.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Camera className="h-3 w-3 shrink-0" />
                        <span className="truncate">{p.posture_type}</span>
                        <span className="ml-auto shrink-0">{p.created_at}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {companyWorkstations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum posto de trabalho encontrado.</p>
            <p className="text-sm">Cadastre postos primeiro.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
