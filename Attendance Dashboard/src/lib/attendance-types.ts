export type AttendanceStatus = "present" | "absent";

export interface Member {
  id: string;
  name: string;
  regNo: string;
}

export interface AttendanceRecord {
  memberId: string;
  date: string;
  status: AttendanceStatus;
}

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
};
