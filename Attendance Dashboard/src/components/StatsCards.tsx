import { Users, UserCheck, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StatsCardsProps {
  total: number;
  present: number;
  absent: number;
  unmarked: number;
}

const cards = [
  { key: "total", label: "Total Members", icon: Users, gradient: "from-primary/10 to-primary/5" },
  { key: "present", label: "Present", icon: UserCheck, gradient: "from-success/10 to-success/5" },
  { key: "absent", label: "Absent", icon: UserX, gradient: "from-destructive/10 to-destructive/5" },
] as const;

const iconColors: Record<string, string> = {
  total: "text-primary",
  present: "text-success",
  absent: "text-destructive",
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 600;
    const start = Date.now();
    const startVal = display;
    const diff = value - startVal;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]);

  return <span>{display}</span>;
}

export function StatsCards({ total, present, absent }: StatsCardsProps) {
  const values: Record<string, number> = { total, present, absent };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {cards.map(({ key, label, icon: Icon, gradient }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="premium-card p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4"
        >
          <div className={`rounded-xl p-2.5 sm:p-3.5 bg-gradient-to-br ${gradient}`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColors[key]}`} />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider leading-tight">
              {label}
            </p>
            <p className="text-xl sm:text-3xl font-bold text-card-foreground tabular-nums">
              <AnimatedNumber value={values[key]} />
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
