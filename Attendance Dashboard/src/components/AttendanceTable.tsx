import { Member, AttendanceStatus, STATUS_LABELS } from "@/lib/attendance-types";
import { Trash2, MoreVertical, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AttendanceTableProps {
  members: Member[];
  getStatus: (memberId: string) => AttendanceStatus | undefined;
  onMark: (memberId: string, status: AttendanceStatus) => void;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

const statusButtons: { status: AttendanceStatus; label: string }[] = [
  { status: "present", label: "P" },
  { status: "absent", label: "A" },
];

function StatusBadge({ status }: { status?: AttendanceStatus }) {
  if (!status) return <span className="text-xs text-muted-foreground italic">—</span>;

  const styles: Record<AttendanceStatus, string> = {
    present: "bg-success/15 text-success border-success/20",
    absent: "bg-destructive/15 text-destructive border-destructive/20",
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </motion.span>
  );
}

function MarkButton({
  status,
  label,
  isActive,
  onClick,
}: {
  status: AttendanceStatus;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 ${
        isActive
          ? status === "present"
            ? "bg-success text-success-foreground shadow-md shadow-success/25"
            : "bg-destructive text-destructive-foreground shadow-md shadow-destructive/25"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }`}
    >
      {label}
    </motion.button>
  );
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: "easeOut" as const },
  }),
};

export function AttendanceTable({ members, getStatus, onMark, onEdit, onDelete }: AttendanceTableProps) {
  return (
    <div className="premium-card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reg No</th>
              <th className="text-center px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-center px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mark</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                      </div>
                      <p className="font-medium">No members found</p>
                      <p className="text-sm">Add members to start tracking attendance</p>
                    </div>
                  </td>
                </tr>
              )}
              {members.map((member, index) => {
                const currentStatus = getStatus(member.id);
                return (
                  <motion.tr
                    key={member.id}
                    custom={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-card-foreground text-sm">{member.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">{member.regNo}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={currentStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {statusButtons.map(({ status, label }) => (
                          <MarkButton
                            key={status}
                            status={status}
                            label={label}
                            isActive={currentStatus === status}
                            onClick={() => onMark(member.id, status)}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => onEdit(member)} className="rounded-lg">
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive rounded-lg">
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove member?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove <strong>{member.name}</strong> and all their attendance records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(member.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="sm:hidden divide-y divide-border">
        <AnimatePresence mode="popLayout">
          {members.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">📋</span>
                <p className="font-medium">No members found</p>
              </div>
            </div>
          )}
          {members.map((member, index) => {
            const currentStatus = getStatus(member.id);
            return (
              <motion.div
                key={member.id}
                custom={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                layout
                className="p-4 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-card-foreground text-sm truncate">{member.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{member.regNo}</p>
                  <div className="mt-1.5">
                    <StatusBadge status={currentStatus} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {statusButtons.map(({ status, label }) => (
                    <MarkButton
                      key={status}
                      status={status}
                      label={label}
                      isActive={currentStatus === status}
                      onClick={() => onMark(member.id, status)}
                    />
                  ))}
                </div>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => onEdit(member)} className="rounded-lg">
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive rounded-lg">
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove member?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove <strong>{member.name}</strong> and all their attendance records.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(member.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
