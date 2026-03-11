interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    title?: string;
}

export default function Card({ children, className = "", noPadding = false, title }: CardProps) {
    return (
        <div className={`bg-white backdrop-blur-xl rounded-[2.5rem] border border-slate-200 shadow-2xl relative overflow-hidden ${className}`}>
            {title && (
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-black tracking-tight">{title}</h3>
                </div>
            )}
            <div className={noPadding ? "" : "p-8"}>
                {children}
            </div>
        </div>
    );
}
