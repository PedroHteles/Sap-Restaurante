export default function MainContainer({ children }) {
    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
        </main>
    );
}
