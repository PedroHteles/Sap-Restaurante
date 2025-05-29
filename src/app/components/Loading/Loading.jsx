export default function Loading({ message = "Carregando..." }) {
    return (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">{message}</p>
        </div>
    );
}
