import { COLORS as C } from '@/Components/Dashboard/theme';

export default function SecondaryButton({ type = 'button', className = '', disabled, children, danger, ...props }) {
    const baseStyle = {
        borderColor: danger ? `${C.red}66` : C.b,
        color: danger ? C.red : C.t2,
        background: danger ? `${C.red}0a` : C.card2,
    };

    return (
        <button
            type={type}
            {...props}
            disabled={disabled}
            className={`inline-flex items-center rounded-md border px-3.5 py-2 text-[0.8rem] font-semibold transition-colors hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
            style={{
                ...baseStyle,
                ...(disabled ? { opacity: 0.4 } : {}),
            }}
        >
            {children}
        </button>
    );
}