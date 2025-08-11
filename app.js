// Shared helpers
const supabase = window.supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

export function $(sel, root=document){ return root.querySelector(sel); }
export function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

export function fmtTimeAgo(iso){
  if(!iso) return "";
  const dt = new Date(iso);
  const diff = (Date.now() - dt.getTime())/60000; // minutes
  if(diff < 1) return "just now";
  if(diff < 60) return `${Math.floor(diff)} min ago`;
  const hrs = diff/60;
  if(hrs < 24) return `${Math.floor(hrs)} hr ago`;
  return dt.toLocaleString();
}

export function badgeClass(state){
  if(state === "VACANT") return "badge green";
  if(state === "PARTIAL") return "badge amber";
  return "badge red";
}

export async function getSession(){
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export { supabase };
