import { Loader2, CheckCircle2, Sparkles, FileDown } from 'lucide-react';

interface JobStatusProps {
    progress: number;
    totalUsers: number;
    showSuccessScreen: boolean;
}

export function JobStatus({ progress, totalUsers, showSuccessScreen }: JobStatusProps) {
    if (showSuccessScreen) {
        return (
            <div className="py-16 px-8 text-center">
                <div className="mx-auto mb-8 w-32 h-32 rounded-full flex items-center justify-center bg-success/15">
                    <CheckCircle2 className="w-20 h-20 text-success" />
                </div>

                <h2 className="text-3xl font-bold mb-4 text-text-primary">
                    ¡Carnets Generados!
                </h2>

                <p className="text-lg mb-8 text-text-secondary">
                    {totalUsers} carnets descargados exitosamente
                </p>

                <div className="flex items-center justify-center gap-2 text-sm font-medium text-success">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span>Descarga completada</span>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl p-6 bg-surface border border-border py-12">
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-primary/10">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2 text-text-primary">
                        Generando carnets...
                    </h3>
                    {totalUsers > 0 && (
                        <p className="text-sm mb-4 text-text-secondary">
                            Procesando {totalUsers} usuario{totalUsers !== 1 ? 's' : ''}
                        </p>
                    )}
                    <div className="flex items-center justify-center gap-2">
                        <FileDown className="w-4 h-4 text-primary" />
                        <span className="text-2xl font-bold font-mono text-primary">
                            {progress}%
                        </span>
                    </div>
                </div>

                <div className="w-full max-w-md">
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
