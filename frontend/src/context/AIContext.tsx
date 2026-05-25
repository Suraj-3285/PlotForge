import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AIContextType {
  isAIEnabled: boolean;
  isStreaming: boolean;
  streamedText: string;
  toggleAI: () => void;
  setIsStreaming: (val: boolean) => void;
  setStreamedText: (val: string) => void;
  appendStreamedText: (val: string) => void;
  clearStreamedText: () => void;
}

//creating context
const AIContext = createContext<AIContextType | null>(null);



export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");

  const toggleAI = () => setIsAIEnabled((prev) => !prev);

  const appendStreamedText = (text: string) => {
    setStreamedText((prev) => prev + text);
  };

  const clearStreamedText = () => setStreamedText("");

  return (
    <AIContext.Provider
      value={{
        isAIEnabled,isStreaming,streamedText,toggleAI,setIsStreaming,setStreamedText,appendStreamedText,clearStreamedText,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

//Custom Hook
export const useAi = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used inside AIProvider");
  }
  return context;
};