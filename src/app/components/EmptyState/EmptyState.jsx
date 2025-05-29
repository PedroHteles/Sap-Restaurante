export default function EmptyState({
    title = "Nenhum item encontrado",
    message = "Adicione um novo item para começar."
}) {
    return (
        <div className="text-center py-10 bg-white shadow-md rounded-lg p-8">
            <EmptyIcon />
            <h3 className="mt-4 text-xl font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
    );
}

const EmptyIcon = () => (
    <svg
        className="mx-auto h-16 w-16 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
    >
        <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
    </svg>
);
