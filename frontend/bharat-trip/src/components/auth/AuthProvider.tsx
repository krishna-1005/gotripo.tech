import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { fetchMe } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  mongoUser: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mongoUser, setMongoUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const profile = await fetchMe();
          setMongoUser(profile);
        } catch (error) {
          console.error("Failed to fetch mongo user profile", error);
        }
      } else {
        setMongoUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      mongoUser,
      loading,
      signOut: async () => {
        await firebaseSignOut(auth);
      },
    }),
    [user, mongoUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
