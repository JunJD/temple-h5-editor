// src/app/error/page.tsx
export default function ErrorPage({ searchParams }: { searchParams: { message: string } }) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-xl font-bold">出错了</h1>
                <p className="mt-2 text-gray-600">{searchParams.message || '页面加载失败'}</p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    返回上一页
                </button>
            </div>
        </div>
    );
}