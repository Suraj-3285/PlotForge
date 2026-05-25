import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { authService } from "../services/api";

interface AuthContextType{
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: string,user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token,setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try{
                const storedToken = localStorage.getItem("plotforge_token");
                const storedUser = localStorage.getItem("plotforge_user");

                if(storedToken && storedUser){
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    //check validity of token
                    const res = await authService.getMe();
                    setUser(res.data.user);
                    localStorage.setItem("plotforge_user",JSON.stringify(res.data.user));
                }
            }catch(error){
                localStorage.removeItem("plotforge_token");
                localStorage.removeItem("plotforge_user");
                setToken(null);
                setUser(null);
            }finally{
                setIsLoading(false);
            }
        };
        initAuth();
    },[]);

    //login

    const login = (newToken: string,newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("plotforge_token",newToken);
        localStorage.setItem("plotforge_user",JSON.stringify(newUser));
    };

    //logout

    const logout = () =>{
        setToken(null);
        setUser(null);
        localStorage.removeItem("plotforge_token");
        localStorage.removeItem("plotforge_user");
        window.location.href = "/login";
    };

    //update User

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem("plotforge_user",JSON.stringify(updatedUser));
    };

    return(
        <AuthContext.Provider value={{user,token,isLoading,isAuthenticated: !!user && !!token,login,logout,updateUser,}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};