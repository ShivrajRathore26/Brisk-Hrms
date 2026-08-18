import { CalendarCheck, ShieldCheck, Users2 } from "lucide-react";

const features = [
  { icon: CalendarCheck, text: "Attendance, leave, and payroll approvals in one place" },
  { icon: Users2, text: "Role-based access for Admins, HR, Managers, and Employees" },
  { icon: ShieldCheck, text: "Geofenced punch-in, so attendance means what it says" },
];

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-[45%] max-w-xl shrink-0 overflow-hidden bg-gradient-to-br from-accent-600 via-accent-600 to-accent-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent-400/30 blur-3xl" />
         
        <div className="flex items-center gap-1">

        <img src="/BClogo.png" alt="BriskCovey" className="w-8 h-8  bg-white p-0.5 rounded-full shrink-0 object-contain" />
        <span className="relative text-lg font-semibold tracking-tight text-white">HRMS</span>

        </div>
        <div className="relative mt-auto">
          <h2 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight text-white">
            Run your workforce, simply.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-accent-100">
            Everything HR needs to manage people — attendance, leave, assets, and reports — built for how your
            office actually works.
          </p>
          <ul className="mt-8 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/90">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon size={15} />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">{children}</div>
    </div>
  );
}
