export const StatCard = ({
    label,
    val,
    color,
}: {
    label: string;
    val: number;
    color: string;
}) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <div>
            <p className="text-[10px] uppercase font-semibold text-gray-400">
                {label}
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{val}</p>
        </div>
    </div>
);
