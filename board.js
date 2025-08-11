import { $, supabase, fmtTimeAgo, badgeClass } from "./app.js";

async function loadBoard(){
  const { data: businesses, error: bizErr } = await supabase
    .from("businesses")
    .select("id,name,city,state,slug,idleThresholdMinutes,contactPhone");

  if(bizErr){ console.error(bizErr); $("#board").innerHTML = "Error loading businesses."; return; }

  const { data: tables, error: tblErr } = await supabase
    .from("pool_tables")
    .select("id,business_id,name,state,note,updated_at")
    .order("name",{ascending:true});

  if(tblErr){ console.error(tblErr); $("#board").innerHTML = "Error loading tables."; return; }

  const byBiz = new Map();
  for(const t of tables){
    if(!byBiz.has(t.business_id)) byBiz.set(t.business_id, []);
    byBiz.get(t.business_id).push(t);
  }

  const container = $("#board");
  container.innerHTML = "";
  for(const b of (businesses||[]).sort((a,b)=>a.name.localeCompare(b.name))){
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "flex";
    header.innerHTML = `<div>
       <div style="font-weight:700">${b.name}</div>
       <div class="small">${b.city}, ${b.state}</div>
     </div>`;
    card.appendChild(header);

    const list = document.createElement("div");
    list.className = "grid";
    const items = byBiz.get(b.id) || [];
    for(const t of items){
      const stale = (t.updated_at ? ((Date.now()-new Date(t.updated_at).getTime())/60000) > (b.idleThresholdMinutes||0) : false);
      const row = document.createElement("div");
      row.className = "table-row" + (stale ? " stale" : "");
      row.innerHTML = `
        <div>
          <div style="font-weight:600">${t.name}</div>
          <div class="small">${t.note ? t.note : ""}</div>
        </div>
        <div class="${badgeClass(t.state)}">${t.state.replace("_"," ")}</div>
      `;
      list.appendChild(row);
    }
    card.appendChild(list);
    container.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", loadBoard);
