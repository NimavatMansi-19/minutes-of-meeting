interface SectionProps {
    children: React.ReactNode;
    className?: string;
}

export default function Section({ children, className = "" }: SectionProps) {
    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 ${className}`}>
            {children}
        </div>
    );
}
