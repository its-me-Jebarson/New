import { useState, useCallback, useMemo, useEffect } from "react";
import { AttendanceStatus } from "@/lib/attendance-types";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface DbMember {
  id: string;
  name: string;
  reg_no: string;
}

function toMember(m: DbMember) {
  return { id: m.id, name: m.name, regNo: m.reg_no };
}

export function useAttendance() {
  const [dbMembers, setDbMembers] = useState<DbMember[]>([]);
  const [records, setRecords] = useState<{ member_id: string; attendance_date: string; status: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const members = useMemo(() => dbMembers.map(toMember), [dbMembers]);

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase.from("members").select("id, name, reg_no").order("reg_no");
    if (error) { toast.error(error.message); return; }
    setDbMembers(data || []);
  }, []);

  const fetchAttendance = useCallback(async () => {
    const { data, error } = await supabase
      .from("attendance_records")
      .select("member_id, attendance_date, status")
      .eq("attendance_date", dateKey);
    if (error) { toast.error(error.message); return; }
    setRecords(data || []);
  }, [dateKey]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMembers(), fetchAttendance()]).finally(() => setLoading(false));
  }, [fetchMembers, fetchAttendance]);

  const addMember = useCallback(async (member: { name: string; regNo: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("members").insert({ name: member.name, reg_no: member.regNo, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    toast.success(`✔ Member "${member.name}" added successfully!`);
    fetchMembers();
  }, [fetchMembers]);

  const importMembers = useCallback(async (list: { name: string; regNo: string }[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Duplicate detection: filter out members whose reg_no already exists
    const existingRegNos = new Set(dbMembers.map((m) => m.reg_no.toLowerCase()));
    const newMembers = list.filter((m) => {
      if (!m.regNo) return true; // no reg number — always import
      return !existingRegNos.has(m.regNo.toLowerCase());
    });
    const skipped = list.length - newMembers.length;

    if (newMembers.length === 0) {
      toast.info(`All ${list.length} member(s) already exist. No new members imported.`);
      return;
    }

    const rows = newMembers.map((m) => ({ name: m.name, reg_no: m.regNo, user_id: user.id }));
    const { error } = await supabase.from("members").insert(rows);
    if (error) { toast.error(error.message); return; }

    const msg = skipped > 0
      ? `✔ ${newMembers.length} member(s) imported! (${skipped} duplicate(s) skipped)`
      : `✔ ${newMembers.length} member(s) imported successfully!`;
    toast.success(msg);
    fetchMembers();
  }, [fetchMembers, dbMembers]);

  const updateMember = useCallback(async (id: string, updates: { name?: string; regNo?: string }) => {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.regNo !== undefined) payload.reg_no = updates.regNo;
    const { error } = await supabase.from("members").update(payload).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("✔ Member updated successfully!");
    fetchMembers();
  }, [fetchMembers]);

  const deleteMember = useCallback(async (id: string) => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("✔ Member removed successfully!");
    fetchMembers();
    fetchAttendance();
  }, [fetchMembers, fetchAttendance]);

  const deleteAllMembers = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("members").delete().eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success("✔ All members removed successfully!");
    fetchMembers();
    fetchAttendance();
  }, [fetchMembers, fetchAttendance]);

  const markAttendance = useCallback(async (memberId: string, status: AttendanceStatus) => {
    const { error } = await supabase
      .from("attendance_records")
      .upsert({ member_id: memberId, attendance_date: dateKey, status }, { onConflict: "member_id,attendance_date" });
    if (error) { toast.error(error.message); return; }
    fetchAttendance();
  }, [dateKey, fetchAttendance]);

  const markAllPresent = useCallback(async () => {
    if (members.length === 0) {
      toast.error("No members to mark.");
      return;
    }
    const rows = members.map((m) => ({
      member_id: m.id,
      attendance_date: dateKey,
      status: "present" as const,
    }));
    const { error } = await supabase
      .from("attendance_records")
      .upsert(rows, { onConflict: "member_id,attendance_date" });
    if (error) { toast.error(error.message); return; }
    toast.success(`✔ All ${members.length} member(s) marked present!`);
    fetchAttendance();
  }, [members, dateKey, fetchAttendance]);

  const getStatus = useCallback(
    (memberId: string): AttendanceStatus | undefined => {
      const r = records.find((r) => r.member_id === memberId && r.attendance_date === dateKey);
      return r?.status as AttendanceStatus | undefined;
    },
    [records, dateKey]
  );

  const stats = useMemo(() => {
    const dayRecords = records.filter((r) => r.attendance_date === dateKey);
    return {
      total: members.length,
      present: dayRecords.filter((r) => r.status === "present").length,
      absent: dayRecords.filter((r) => r.status === "absent").length,
      unmarked: members.length - dayRecords.length,
    };
  }, [members, records, dateKey]);

  const submitAttendance = useCallback(() => {
    const dayRecords = records.filter((r) => r.attendance_date === dateKey);
    const unmarked = members.length - dayRecords.length;
    if (unmarked > 0) {
      toast.error(`Please mark attendance for all ${unmarked} remaining member(s) before submitting.`);
      return;
    }
    toast.success(`✔ Attendance for ${dateKey} submitted successfully!`);
  }, [members, records, dateKey]);

  const downloadCSV = useCallback(() => {
    const header = "Name,Reg No,Date,Status\n";
    const rows = members
      .map((m) => {
        const status = records.find((r) => r.member_id === m.id && r.attendance_date === dateKey)?.status ?? "unmarked";
        return `"${m.name}","${m.regNo}","${dateKey}","${status}"`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${dateKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("✔ CSV exported successfully!");
  }, [members, records, dateKey]);

  return {
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
    dateKey,
    loading,
  };
}
