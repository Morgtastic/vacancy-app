import { $, supabase, fmtTimeAgo, badgeClass, getSession } from "./app.js";

function getParam(name){
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

async function ensureLogin(){
  const session = await getSession();
  const bizSlug = getParam("business");
  if(!session){
    // show login form
    $("#login").classList.remove("hidden");
    $("#app").classList.add("hidden");
    $("#loginEmail").focus();
    $("#loginForm").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const email = $("#loginEmail").value.trim();
      const password = $("#loginPassword").value.trim();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if(error){ $("#loginError").textContent = error.message; return; }
      location.reload();
    });
  } else {
    $("#login").classList.add("hidden");
    $("#app").classList.remove("hidden");
    loadBusiness(bizSlug);
  }
}

async function loadBusiness(slug){
  if(!slug){ $("#app").innerHTML = "Missing ?business=slug"; return; }
  const { data: business, error } = await supabase
    .from("businesses").select("id,name,slug,idleThresholdMinutes").eq("slug", slug).single();
  if(error || !business){ $("#app").innerHTML = "Business not found."; return; }

  $("#bizName").textContent = business.name;
  await loadTables(business);
}

async function loadTables(business){
  const { data: tables, error } = await supabase
    .from("pool_tables")
    .select("id,name,state,note,updated_at,business_id")
    .eq("business_id", business.id)
    .order("name",{ascending:true});
  if(error){ $("#tables").innerHTML = "Error loading tables."; return; }

  const container = $("#tables");
  container.innerHTML = "";
  for(const t of tables){
    const stale = (t.updated_at ? ((Date.now()-new Date(t.updated_at).getTime())/60000) > (business.idleThresholdMinutes||0) : false);
    const row = document.createElement("div");
    row.className = "table-row" + (stale ? " stale" : "");
    row.innerHTML = `
      <div style="flex:1;min-width:140px">
        <div style="font-weight:600">${t.name}</div>
        <div class="small">${t.updated_at ? "Updated " + fmtTimeAgo(t.updated_at) : "Never updated"}</div>
        <div class="small">${t.note ? t.note : ""}</div>
      </div>
      <div class="state-buttons">
        <button class="button" data-state="VACANT">VACANT</button>
        <button class="button" data-state="PARTIAL">PARTIAL</button>
        <button class="button" data-state="NO_VACANCY">NO_VACANCY</button>
      </div>
    `;
    const buttons = row.querySelectorAll("button");
    buttons.forEach(btn => {
      btn.addEventListener("click", async ()=>{
        const newState = btn.dataset.state;
        const { error } = await supabase
          .from("pool_tables")
          .update({
            state: newState,
            updated_at: new Date().toISOString()
          }).eq("id", t.id);
        if(error){ alert("Update failed: " + error.message); return; }
        await loadTables(business); // refresh
      });
    });
    container.appendChild(row);
  }
}

document.addEventListener("DOMContentLoaded", ensureLogin);
