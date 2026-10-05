export default function CheckField({ label, hint, ...props }) {
    return (
        <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" {...props} />
            <span>
                <span className="font-medium text-slate-700">{label}</span>
                {hint && <span className="block text-xs text-slate-400">{hint}</span>}
            </span>
        </label>
    )
}