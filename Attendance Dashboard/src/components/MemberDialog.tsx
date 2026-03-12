import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Member } from "@/lib/attendance-types";

interface MemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member;
  onSave: (data: Omit<Member, "id">) => void;
}

export function MemberDialog({ open, onOpenChange, member, onSave }: MemberDialogProps) {
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRegNo(member.regNo);
    } else {
      setName("");
      setRegNo("");
    }
  }, [member, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), regNo: regNo.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {member ? "Edit Member" : "Add Member"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regNo">Reg No</Label>
            <Input id="regNo" value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="e.g. REG001" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{member ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
