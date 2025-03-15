import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ContentType } from '@prisma/client';

// Define the context interface
interface ContentCreationContextType {
  openContentCreationModal: (contentType: ContentType, onSuccessCallback?: () => void) => void;
  closeContentCreationModal: () => void;
  isContentCreationModalOpen: boolean;
  currentContentType: ContentType | null;
  onSuccessCallback: (() => void) | null;
}

// Create the context with a default value
const ContentCreationContext = createContext<ContentCreationContextType>({
  openContentCreationModal: () => {},
  closeContentCreationModal: () => {},
  isContentCreationModalOpen: false,
  currentContentType: null,
  onSuccessCallback: null,
});

// Hook to use the context
export const useContentCreation = () => useContext(ContentCreationContext);

// Provider component
interface ContentCreationProviderProps {
  children: ReactNode;
}

export const ContentCreationProvider = ({ children }: ContentCreationProviderProps) => {
  const [isContentCreationModalOpen, setIsContentCreationModalOpen] = useState(false);
  const [currentContentType, setCurrentContentType] = useState<ContentType | null>(null);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

  const openContentCreationModal = (contentType: ContentType, callback?: () => void) => {
    setCurrentContentType(contentType);
    if (callback) {
      setOnSuccessCallback(() => callback);
    }
    setIsContentCreationModalOpen(true);
  };

  const closeContentCreationModal = () => {
    setIsContentCreationModalOpen(false);
    setCurrentContentType(null);
    setOnSuccessCallback(null);
  };

  return (
    <ContentCreationContext.Provider
      value={{
        openContentCreationModal,
        closeContentCreationModal,
        isContentCreationModalOpen,
        currentContentType,
        onSuccessCallback,
      }}
    >
      {children}
    </ContentCreationContext.Provider>
  );
}; 