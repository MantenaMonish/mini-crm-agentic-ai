import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CRMContextType {
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  selectedLead: any | null;
  setSelectedLead: (lead: any | null) => void;
  showInteractModal: boolean;
  setShowInteractModal: (show: boolean) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

interface CRMProviderProps {
  children: ReactNode;
}

export const CRMProvider: React.FC<CRMProviderProps> = ({ children }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [showInteractModal, setShowInteractModal] = useState(false);

  return (
    <CRMContext.Provider
      value={{
        statusFilter,
        setStatusFilter,
        selectedLead,
        setSelectedLead,
        showInteractModal,
        setShowInteractModal,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};
