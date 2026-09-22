import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export function useAdmin() {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const { data } = await supabase
        .from("admin_profiles")
        .select("id, name, email")
        .eq("id", user.id)
        .maybeSingle();
      if (data) return data;
      return { id: user.id, name: "Admin", email: user.email ?? "" };
    },
    staleTime: 60_000,
  });
}
