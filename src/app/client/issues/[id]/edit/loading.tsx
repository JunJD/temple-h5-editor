export default function IssueEditLoading() {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
                加载编辑器...
            </div>
        </div>
    )
}
