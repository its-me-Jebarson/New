import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (members: { name: string; regNo: string }[]) => void;
}

export function ImportCSVDialog({ open, onOpenChange, onImport }: ImportCSVDialogProps) {
  const [preview, setPreview] = useState<{ name: string; regNo: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV must have a header row and at least one data row");
        return;
      }

      const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
      const nameIdx = header.findIndex((h) => h === "name");
      const regIdx = header.findIndex((h) => ["reg no", "regno", "reg_no", "registration", "registration number"].includes(h));

      if (nameIdx === -1) {
        toast.error('CSV must have a "Name" column');
        return;
      }

      const parsed: { name: string; regNo: string }[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const name = cols[nameIdx]?.trim();
        const regNo = regIdx !== -1 ? cols[regIdx]?.trim() || "" : "";
        if (name) parsed.push({ name, regNo });
      }

      if (parsed.length === 0) {
        toast.error("No valid rows found in CSV");
        return;
      }

      setPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    onImport(preview);
    setPreview([]);
    onOpenChange(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setPreview([]);
      if (fileRef.current) fileRef.current.value = "";
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Import Members from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a CSV file with columns: <strong>Name</strong> and <strong>Reg No</strong> (optional).
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
          />
          {preview.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">#</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Reg No</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((m, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-1.5 text-card-foreground">{m.name}</td>
                      <td className="px-3 py-1.5 font-mono text-card-foreground">{m.regNo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={preview.length === 0}>
            <Upload className="h-4 w-4 mr-1.5" />
            Import {preview.length > 0 ? `${preview.length} members` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
