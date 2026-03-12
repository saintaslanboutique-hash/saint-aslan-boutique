import AppShell from "@/app/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <AppShell>
                {children}
            </AppShell>
        </div>
    )
}