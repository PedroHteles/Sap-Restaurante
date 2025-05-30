import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        content: null,
    });

    const openModal = ({ title, content }) => {
        setModal({ isOpen: true, title, content });
    };

    const closeModal = () => {
        setModal({ isOpen: false, title: '', content: null });
    };

    return (
        <ModalContext.Provider value={{ ...modal, openModal, closeModal }}>
            {children}

            {modal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">{modal.title}</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                                aria-label="Fechar modal"
                            >
                                &times;
                            </button>
                        </div>
                        {modal.content}
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);
