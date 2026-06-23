import { create } from "zustand";
import type { User as AuthUser } from "@supabase/supabase-js";
import { ColegioInfo, getStoredColegios, getStoredUsers, supabase, UserProfile } from "../supabase/client";

type ColegioState = {
  id: string;
  nombre: string;
  logo: string;
  plan?: string;
  color_primario?: string;
  limite_alumnos?: number;
  limite_personalizado?: number;
};

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  colegio: ColegioState | null;
  login: (email: string, password?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  updateUserProfile: (nombre: string, apellido: string, fotoUrl: string) => void;
  updateColegioInfo: (nombre: string, logo: string, colorPrimario?: string) => void;
}

export type LoginFailureReason = "invalid_credentials" | "email_unconfirmed" | "inactive" | "profile_unavailable" | "configuration";
export type LoginResult = { ok: true } | { ok: false; reason: LoginFailureReason };

// Nunca permitimos que una variable antigua de Vercel active datos demo en producción.
const demoAuthEnabled = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";

function mapColegio(colegio: Partial<ColegioInfo> & { id: string; nombre: string }): ColegioState {
  return {
    id: colegio.id,
    nombre: colegio.nombre,
    logo: colegio.logo ?? "",
    plan: colegio.plan,
    color_primario: colegio.color_primario,
    limite_alumnos: colegio.limite_alumnos,
    limite_personalizado: colegio.limite_personalizado,
  };
}

async function readSupabaseProfile(authUser: AuthUser): Promise<{ value: { user: UserProfile; colegio: ColegioState | null } | null; reason?: LoginFailureReason }> {
  const { data: profile, error } = await supabase.from("usuarios").select("id, colegio_id, rol, nombre, apellido, dni, foto_url, activo").eq("id", authUser.id).single();
  if (error || !profile) {
    // app_metadata la administra exclusivamente el servidor de Supabase. Este
    // respaldo permite recuperar al Super Admin si una política RLS antigua
    // impide leer public.usuarios, sin confiar en un rol editable por el usuario.
    const trustedRole = authUser.app_metadata?.rol;
    if (trustedRole === "superadmin") {
      return {
        value: {
          user: {
            id: authUser.id,
            colegio_id: null,
            rol: "superadmin",
            nombre: authUser.user_metadata?.nombre ?? "Administrador",
            apellido: authUser.user_metadata?.apellido ?? "Doce",
            dni: authUser.user_metadata?.dni ?? "",
            foto_url: authUser.user_metadata?.foto_url ?? "/brand/doce-icon.svg",
            email: authUser.email,
            activo: true,
          },
          colegio: null,
        },
      };
    }
    return { value: null, reason: "profile_unavailable" };
  }
  if (profile.activo === false) return { value: null, reason: "inactive" };

  let colegio: ColegioState | null = null;
  if (profile.colegio_id) {
    const { data: tenant } = await supabase.from("colegios").select("id, nombre, logo_url, color_primario").eq("id", profile.colegio_id).single();
    if (tenant) colegio = mapColegio({ id: tenant.id, nombre: tenant.nombre, logo: tenant.logo_url ?? "", color_primario: tenant.color_primario ?? undefined });
  }

  return { value: {
    user: {
      id: profile.id,
      colegio_id: profile.colegio_id,
      rol: profile.rol,
      nombre: profile.nombre,
      apellido: profile.apellido,
      dni: profile.dni,
      foto_url: profile.foto_url ?? "",
      email: authUser.email,
      activo: profile.activo,
    },
    colegio,
  } };
}

export const useAuthStore = create<AuthState>((set, get) => {
  const hydrate = async (authUser: AuthUser | null) => {
    if (!authUser) {
      set({ user: null, colegio: null, loading: false });
      return { value: null, reason: "profile_unavailable" as LoginFailureReason };
    }
    const result = await readSupabaseProfile(authUser);
    set(result.value ? { ...result.value, loading: false } : { user: null, colegio: null, loading: false });
    return result;
  };

  if (typeof window !== "undefined") {
    queueMicrotask(async () => {
      if (demoAuthEnabled) {
        const raw = localStorage.getItem("doce_demo_session");
        if (!raw) return set({ loading: false });
        try {
          const user = JSON.parse(raw) as UserProfile;
          const tenant = user.colegio_id ? getStoredColegios().find((item) => item.id === user.colegio_id) : null;
          set({ user, colegio: tenant ? mapColegio(tenant) : null, loading: false });
        } catch {
          localStorage.removeItem("doce_demo_session");
          set({ loading: false });
        }
        return;
      }
      const { data } = await supabase.auth.getSession();
      await hydrate(data.session?.user ?? null);
    });

    if (!demoAuthEnabled) {
      supabase.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => void hydrate(session?.user ?? null), 0);
      });
    }
  }

  return {
    user: null,
    loading: true,
    colegio: null,
    login: async (email, password) => {
      set({ loading: true });
      const cleanEmail = email.trim().toLowerCase();

      if (demoAuthEnabled) {
        const matchedUser = getStoredUsers().find((item) => item.email?.toLowerCase() === cleanEmail && item.activo !== false);
        if (!matchedUser) {
          set({ loading: false });
          return { ok: false, reason: "invalid_credentials" };
        }
        const tenant = matchedUser.colegio_id ? getStoredColegios().find((item) => item.id === matchedUser.colegio_id && item.activo) : null;
        if (matchedUser.colegio_id && !tenant) {
          set({ loading: false });
          return { ok: false, reason: "inactive" };
        }
        localStorage.setItem("doce_demo_session", JSON.stringify(matchedUser));
        set({ user: matchedUser, colegio: tenant ? mapColegio(tenant) : null, loading: false });
        return { ok: true };
      }

      if (!password) {
        set({ loading: false });
        return { ok: false, reason: "invalid_credentials" };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error || !data.user) {
        set({ loading: false });
        const message = error?.message.toLowerCase() ?? "";
        if (message.includes("email not confirmed")) return { ok: false, reason: "email_unconfirmed" };
        if (message.includes("invalid login credentials")) return { ok: false, reason: "invalid_credentials" };
        return { ok: false, reason: "configuration" };
      }
      const profileResult = await hydrate(data.user);
      if (!profileResult.value) {
        await supabase.auth.signOut();
        return { ok: false, reason: profileResult.reason ?? "profile_unavailable" };
      }
      return { ok: true };
    },
    logout: async () => {
      if (demoAuthEnabled) localStorage.removeItem("doce_demo_session");
      else await supabase.auth.signOut();
      set({ user: null, colegio: null, loading: false });
    },
    setUser: (user) => set({ user }),
    updateUserProfile: (nombre, apellido, fotoUrl) => {
      const { user } = get();
      if (!user) return;
      const updated = { ...user, nombre, apellido, foto_url: fotoUrl };
      set({ user: updated });
      if (!demoAuthEnabled) void supabase.from("usuarios").update({ nombre, apellido, foto_url: fotoUrl }).eq("id", user.id);
    },
    updateColegioInfo: (nombre, logo, colorPrimario) => {
      const { colegio } = get();
      if (!colegio) return;
      set({ colegio: { ...colegio, nombre, logo, color_primario: colorPrimario } });
      if (!demoAuthEnabled) void supabase.from("colegios").update({ nombre, logo_url: logo, color_primario: colorPrimario }).eq("id", colegio.id);
    },
  };
});
