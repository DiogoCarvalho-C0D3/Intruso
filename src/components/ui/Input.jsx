export default function Input({ label, type = 'text', ...props }) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && <label className="text-sm font-semibold text-color-text-muted mb-1 block">{label}</label>}
            <input
                type={type}
                className="input-field"
                {...props}
            />
        </div>
    );
}
