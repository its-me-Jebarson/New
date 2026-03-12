import { useState, useMemo } from "react";
import { format, addDays, subDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Download, Plus, CalendarDays, Send, Search, LogOut, Upload, CheckCheck, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAttendance } from "@/hooks/useAttendance";
import { StatsCards } from "@/components/StatsCards";
import { AttendanceTable } from "@/components/AttendanceTable";
import { MemberDialog } from "@/components/MemberDialog";
import { ImportCSVDialog } from "@/components/ImportCSVDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Member } from "@/lib/attendance-types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Index = () => {
  const {
    members,
    selectedDate,
    setSelectedDate,
    addMember,
    updateMember,
    deleteMember,
    deleteAllMembers,
    importMembers,
    markAttendance,
    markAllPresent,
    getStatus,
    stats,
    submitAttendance,
    downloadCSV,
  } = useAttendance();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  const [search, setSearch] = useState("");

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.regNo.toLowerCase().includes(q)
    );
  }, [members, search]);

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingMember(undefined);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<Member, "id">) => {
    if (editingMember) {
      updateMember(editingMember.id, data);
    } else {
      addMember(data);
    }
  };

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const dateKey = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-10"
      >
        {/* Header */}
        <motion.header variants={item} className="mb-8 sm:mb-10">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    Attendance
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Track and manage team attendance</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => supabase.auth.signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={downloadCSV}>
                <Download className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Add</span>
              </Button>
              <Button variant="secondary" size="sm" className="rounded-xl h-9" onClick={markAllPresent}>
                <CheckCheck className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">All Present</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl h-9 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Remove All</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove all members?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove all members? This will permanently delete all members and their attendance records. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAllMembers} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                      Remove All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button size="sm" className="rounded-xl h-9 btn-premium text-white" onClick={submitAttendance}>
                <Send className="h-4 w-4 mr-1.5" />
                Submit
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Date Navigation */}
        <motion.div variants={item} className="premium-card mb-6 sm:mb-8">
          <div className="flex items-center justify-between px-2 sm:px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-secondary"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <AnimatePresence mode="wait">
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary hidden sm:block" />
                  <p className="text-sm sm:text-base font-semibold text-card-foreground">
                    {format(selectedDate, "EEEE, MMMM d")}
                  </p>
                </div>
                {isToday && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-primary font-semibold"
                  >
                    Today
                  </motion.span>
                )}
              </motion.div>
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-secondary"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="mb-6 sm:mb-8">
          <StatsCards {...stats} />
        </motion.div>

        {/* Search */}
        <motion.div variants={item} className="mb-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or registration..."
            className="pl-11 h-11 rounded-xl border-border bg-card focus-visible:ring-primary/30"
          />
        </motion.div>

        {/* Table */}
        <motion.div variants={item}>
          <AttendanceTable
            members={filteredMembers}
            getStatus={getStatus}
            onMark={markAttendance}
            onEdit={handleEdit}
            onDelete={deleteMember}
          />
        </motion.div>

        <MemberDialog open={dialogOpen} onOpenChange={setDialogOpen} member={editingMember} onSave={handleSave} />
        <ImportCSVDialog open={importOpen} onOpenChange={setImportOpen} onImport={importMembers} />
      </motion.div>
    </div>
  );
};

export default Index;
