const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const CONTACTS=[["Ambulance (National)","1234567890"],["Emergency (National)","1234567890"],["Hostel Health Centre","1234567890"],["Warden’s Office","1234567890"],["Campus Security","1234567890"],["Counselling Helpline","1234567890"]];
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cHTML=c=>c.map(x=>`<div class="contact"><span>${x[0]}</span><a href="tel:${x[1]}">${x[1]}</a></div>`).join("");
const today=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);

/* Shared: theme + SOS (on every page) */
document.body.insertAdjacentHTML("beforeend",`<button class="sos" id="sosb" aria-label="Emergency SOS">SOS</button><div class="modal" id="sosm"><div class="card"><h3 style="margin-top:0;color:var(--red)">🚨 Emergency help</h3><p class="sub">Stay calm. Tap to call now.</p>${cHTML(CONTACTS.slice(0,5))}<p><button class="btn" style="width:100%" id="sosc">Close</button></p></div></div>`);
$("#sosb").onclick=()=>$("#sosm").classList.add("show");
$("#sosc").onclick=()=>$("#sosm").classList.remove("show");
$("#sosm").onclick=e=>{if(e.target.id==="sosm")e.target.classList.remove("show")};
$("#theme").onclick=()=>{const r=document.documentElement;const dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=dark?"light":"dark";store.set("theme",r.dataset.theme)};
const th=store.get("theme",null);if(th)document.documentElement.dataset.theme=th;

/* Page 2: appointment wizard */
if($("#wiz")){
  const DOCS=[["General Physician","🩺","Fever, cold, check-ups"],["Dentist","🦷","Tooth pain, cleaning"],["Counsellor","💬","Stress, sleep, private talks"],["Physiotherapist","💪","Muscle and sports pain"],["Women’s Health","🌸","Confidential care"],["Eye Care","👁️","Vision and eye strain"]];
  const SLOTS=["09:00","10:00","11:00","12:00","14:00","15:00","16:00"];
  let appts=store.get("appts",[]),st=1,f={doc:"",dt:today,tm:""};
  const dt=$("#dt");dt.min=today;dt.value=today;
  $("#docs").innerHTML=DOCS.map(d=>`<button class="doc" data-d="${d[0]}"><span>${d[1]}</span><b>${d[0]}</b><small>${d[2]}</small></button>`).join("");
  function slots(){const now=new Date().toTimeString().slice(0,5);
    $("#slots").innerHTML=SLOTS.map(t=>{const off=appts.some(a=>a.d===f.doc&&a.dt===f.dt&&a.tm===t)||(f.dt===today&&t<=now);return `<button class="chip${f.tm===t?" on":""}" data-t="${t}"${off?" disabled":""}>${t}</button>`}).join("")}
  function err(m){const e=$("#err");e.hidden=!m;e.textContent=m||""}
  function show(){err("");
    $$(".pane").forEach(p=>p.hidden=+p.dataset.s!==st);
    $$("#steps span").forEach((s,i)=>s.className=i+1<st?"done":i+1===st?"on":"");
    $("#back").hidden=st===1||st===5;$("#next").hidden=st===5;$("#next").textContent=st===4?"Confirm booking ✓":"Next →";
    if(st===2)slots();
    if(st===4)$("#sum").innerHTML=[["Doctor",f.doc],["Date",f.dt],["Time",f.tm],["Name",f.n],["Room",f.r],["Phone",f.ph||"—"],["Problem",f.rs||"—"]].map(x=>`<div><span>${x[0]}</span><b>${esc(x[1])}</b></div>`).join("")}
  function list(){const l=$("#list");const s=[...appts].sort((a,b)=>(a.dt+a.tm).localeCompare(b.dt+b.tm));
    l.innerHTML=s.length?s.map(a=>`<div class="appt"><div><b>${esc(a.d)}</b> · ${a.id}<small>${a.dt} at ${a.tm} · ${esc(a.n)}, ${esc(a.r)}</small></div><button class="x" data-id="${a.id}" aria-label="Cancel appointment">✕</button></div>`).join(""):'<p class="sub" style="margin:0">No bookings yet.</p>'}
  $("#docs").onclick=e=>{const b=e.target.closest(".doc");if(!b)return;f.doc=b.dataset.d;f.tm="";$$(".doc").forEach(x=>x.classList.toggle("on",x===b));err("")};
  dt.onchange=()=>{f.dt=dt.value||today;f.tm="";slots()};
  $("#slots").onclick=e=>{const t=e.target.dataset.t;if(!t)return;f.tm=t;slots();err("")};
  $("#back").onclick=()=>{st--;show()};
  $("#next").onclick=()=>{
    if(st===1&&!f.doc)return err("Please choose a doctor.");
    if(st===2){if(!f.dt||f.dt<today)return err("Please pick today or a future date.");if(!f.tm)return err("Please pick a time slot.")}
    if(st===3){f.n=$("#n").value.trim();f.r=$("#r").value.trim();f.ph=$("#ph").value.trim();f.rs=$("#rs").value.trim();if(!f.n||!f.r)return err("Please enter your name and hostel room.")}
    if(st===4){const id="CC-"+Math.floor(1000+Math.random()*9000);appts.push({id,d:f.doc,dt:f.dt,tm:f.tm,n:f.n,r:f.r,ph:f.ph,rs:f.rs});store.set("appts",appts);
      $("#tid").textContent=id;$("#tinfo").textContent=f.doc+" · "+f.dt+" at "+f.tm;list()}
    st++;show()};
  $("#again").onclick=()=>{f={doc:"",dt:today,tm:""};dt.value=today;$$(".doc").forEach(x=>x.classList.remove("on"));["n","r","ph","rs"].forEach(i=>$("#"+i).value="");st=1;show()};
  $("#list").onclick=e=>{const id=e.target.dataset.id;if(!id)return;appts=appts.filter(a=>a.id!==id);store.set("appts",appts);list();if(st===2)slots()};
  show();list();
}

/* Page 3: health tools */
if($("#sym")){
  $("#cts").innerHTML=cHTML(CONTACTS);
  const SYM={fever:"Fever",cough:"Cough",cold:"Runny nose",throat:"Sore throat",head:"Headache",stomach:"Stomach pain",vomit:"Vomiting / loose motions",body:"Body ache",chest:"Chest pain",breath:"Breathing difficulty",stress:"Anxious / low mood",rash:"Skin rash"};
  const sel=new Set();
  $("#sym").innerHTML=Object.entries(SYM).map(([k,v])=>`<button class="chip" data-k="${k}">${v}</button>`).join("");
  $("#sym").onclick=e=>{const k=e.target.dataset.k;if(!k)return;sel.has(k)?sel.delete(k):sel.add(k);e.target.classList.toggle("on")};
  $("#chk").onclick=()=>{const r=$("#chkres");r.hidden=false;const s=sel;
    if(!s.size){r.className="result";r.textContent="Select at least one symptom.";return}
    if(s.has("chest")||s.has("breath")){r.className="result warn";r.innerHTML="🚨 <b>Chest pain or breathing trouble needs urgent care.</b> Tap the red SOS button or call the health centre right now. Don’t wait.";return}
    const t=[];
    if(s.has("fever")&&(s.has("cough")||s.has("throat")||s.has("cold")||s.has("body")))t.push("Looks like a possible viral flu or cold. Rest, drink warm fluids, and monitor your temperature.");
    if(s.has("stomach")||s.has("vomit"))t.push("Possible stomach infection or food upset. Take ORS, eat light food, and avoid outside or oily food.");
    if(s.has("head")&&!s.has("fever"))t.push("Headaches are often from dehydration, poor sleep or screen strain. Drink water, rest your eyes, sleep well.");
    if(s.has("stress"))t.push("It’s okay to not be okay. Talk to a friend, or book a Counsellor. Support is free and private.");
    if(s.has("rash"))t.push("Avoid scratching and new creams. Keep the area clean and show it to the doctor, especially if it spreads.");
    if(!t.length)t.push("Rest, drink water and observe how you feel today.");
    r.className="result";r.innerHTML=t.map(x=>"• "+x).join("<br>")+"<br><br><b>See a doctor</b> if symptoms last more than 2 days or get worse. <a href='#book'>Book an appointment</a>. This is guidance, not a diagnosis."};
  let wat=store.get("water:"+today,0);
  $("#gl").innerHTML=Array.from({length:8},(_,i)=>`<button class="glass" data-i="${i}" aria-label="Glass ${i+1}"></button>`).join("");
  const showW=()=>{$$(".glass").forEach((g,i)=>g.classList.toggle("on",i<wat));$("#wb").style.width=wat/8*100+"%";$("#wt").textContent=wat+" of 8 glasses"+(wat>=8?" 🎉 Goal reached!":"")};
  $("#gl").onclick=e=>{const i=e.target.dataset.i;if(i===undefined)return;wat=(wat===+i+1)?+i:+i+1;store.set("water:"+today,wat);showW()};showW();
  const MT=["Wonderful! Keep doing what works for you.","Good to hear. A short walk can make it even better.","Fine days are okay. Try a quick stretch or chat with a friend.","Sorry you’re feeling low. Take a break, breathe slowly for a minute and talk to someone you trust.","That sounds hard. You’re not alone. Please consider talking to the campus counsellor or a friend today."];
  $("#md").onclick=e=>{const m=e.target.dataset.m;if(m===undefined)return;$$("#md button").forEach(b=>b.classList.toggle("on",b===e.target));const r=$("#mres");r.hidden=false;r.className="result"+(m>=3?" warn":"");r.textContent=MT[m];store.set("mood:"+today,m)};
  const pm=store.get("mood:"+today,null);if(pm!==null){const b=$(`#md [data-m="${pm}"]`);if(b)b.click()}
  $("#bmib").onclick=()=>{const w=+$("#w").value,h=+$("#h").value/100,r=$("#bmir");r.hidden=false;
    if(!w||!h){r.className="result warn";r.textContent="Enter weight and height.";return}
    const b=w/(h*h),c=b<18.5?"Underweight":b<25?"Healthy range":b<30?"Overweight":"High range";
    r.className="result";r.innerHTML=`BMI <b>${b.toFixed(1)}</b> · ${c}<br><small>A rough guide only. Ask the doctor for personal advice.</small>`};
  const sl=$("#sl"),showS=()=>{const v=+sl.value;$("#slt").textContent=v+" hours · "+(v>=7?"Great, well rested! 🌙":v>=5?"A little short. Try an earlier bedtime tonight.":"Very low. Rest today and avoid caffeine late.")};
  sl.oninput=showS;showS();
}
