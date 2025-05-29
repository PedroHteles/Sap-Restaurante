export const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    if (typeof timestamp === 'number') {
        return new Date(timestamp).toLocaleString('pt-BR');
    }

    if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR');
    }

    return 'N/A';
};