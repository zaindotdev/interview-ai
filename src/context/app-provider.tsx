import axios, { AxiosError } from "axios";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";

interface ResumeData {
  id: string;
  analysisResults?: any;
  recommendations?: string[];
  score?: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface AppContextState {
  resumeData: ResumeData | null;
  loading: boolean;
  error: string | null;
}

interface AppContextActions {
  fetchResumeData: () => Promise<void>;
  analyzeResume: (formData: FormData) => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

type AppContextProps = AppContextState & AppContextActions;

const AppContext = createContext<AppContextProps | null>(null);

export function useAppContext(): AppContextProps {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      "useAppContext must be used within an AppProvider. " +
      "Make sure to wrap your component with <AppProvider>."
    );
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      return error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      return "Network error: Unable to reach server";
    } else {
      return error.message || "An unexpected error occurred";
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unknown error occurred";
};

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppContextState>({
    loading: false,
    error: null,
    resumeData: null,
  });

  
  const updateState = useCallback((updates: Partial<AppContextState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

 
  const resetState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      resumeData: null,
    });
  }, []);

 
  const fetchResumeData = useCallback(async (): Promise<void> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await axios.get<ApiResponse<ResumeData>>("/api/resume/report");
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch resume data");
      }
      
      updateState({ 
        resumeData: response.data.data,
        loading: false 
      });
    } catch (error) {
      updateState({ 
        error: handleApiError(error),
        loading: false 
      });
    }
  }, [updateState]);

  const analyzeResume = useCallback(async (formData: FormData): Promise<void> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await axios.post<ApiResponse<ResumeData>>(
        "/api/resume/analysis", 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to analyze resume");
      }
      
      updateState({ 
        resumeData: response.data.data,
        loading: false 
      });
    } catch (error) {
      updateState({ 
        error: handleApiError(error),
        loading: false 
      });
    }
  }, [updateState]);

  const contextValue: AppContextProps = {
    ...state,
    fetchResumeData,
    analyzeResume,
    clearError,
    resetState,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;