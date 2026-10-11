import { useEffect, useMemo, useState } from 'react';
import './style.css';

const API = 'http://localhost:8081/api/tickets';
const categories = [
  { id:'POTHOLE', title:'Potholes & damaged roads', short:'Potholes', image:'/images/pothole.jpg', icon:'⚠️', color:'coral', text:'Report potholes, cracks, broken road surfaces and dangerous depressions.' },
  { id:'DRAINAGE', title:'Drainage & waterlogging', short:'Drainage', image:'/images/drainage.jpg', icon:'🌊', color:'blue', text:'Flag blocked drains, overflowing manholes and waterlogged streets.' },
  { id:'STREET_LIGHT', title:'Street lights', short:'Street lights', image:'/images/streetlight.jpg', icon:'💡', color:'gold', text:'Report dark streets, flickering lights and damaged light poles.' },
  { id:'GARBAGE', title:'Garbage & cleanliness', short:'Garbage', image:'/images/other-issues.jpg', icon:'♻️', color:'green', text:'Help keep roadsides, public spaces and drains clean.' },
  { id:'ROAD_SAFETY', title:'Road safety hazards', short:'Road safety', image:'/images/home-road.jpg', icon:'🚧', color:'purple', text:'Report missing signs, unsafe barriers, exposed work or hazards.' },
  { id:'ROAD_BLOCKAGE', title:'Road blockage', short:'Road blockage', image:'/images/report-pothole.jpg', icon:'🚜', color:'orange', text:'Report fallen trees, debris and obstructions blocking roads.' },
  { id:'PUBLIC_TRANSPORT', title:'Public transport facilities', short:'Public transport', image:'/images/map.jpg', icon:'🚌', color:'teal', text:'Report damaged bus stops and related public infrastructure.' },
  { id:'OTHER', title:'Other infrastructure issue', short:'Other issues', image:'/images/other-issues.jpg', icon:'🛠️', color:'pink', text:'Tell the team about another public infrastructure problem.' },
];
const steps = ['OPEN','VERIFIED','ASSIGNED','IN_PROGRESS','RESOLVED'];
const pretty = s => (s || 'OPEN').replaceAll('_',' ').toLowerCase().replace(/\b\w/g, c=>c.toUpperCase());

export default function App() {
  const [page, setPage] = useState('home');
  const [selected, setSelected] = useState(categories[0]);
  const [tickets, setTickets] = useState([]);
  const [ticketId, setTicketId] = useState('');
  const [tracked, setTracked] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({category:'POTHOLE',title:'',description:'',location:'',reporterName:'',reporterPhone:'',reporterEmail:''});
  const [photos, setPhotos] = useState([]);

  useEffect(() => { loadTickets(); }, []);
  async function loadTickets() {
    try { const r = await fetch(API); if (r.ok) setTickets(await r.json()); } catch {}
  }
  function openReport(category) {
    if (category) { setSelected(category); setForm(f=>({...f,category:category.id,title:f.title || ''})); }
    setPage('report'); setNotice('');
  }
  async function submitReport(e) {
    e.preventDefault(); setBusy(true); setNotice('');
    try {
      const r = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, category:form.category}) });
      if (!r.ok) throw new Error('The server rejected this report.');
      const data = await r.json().catch(()=>({}));
      setNotice(`Report submitted successfully${data.id ? ` — complaint #${data.id}` : ''}. Keep your complaint ID to track progress.`);
      if (data.id) setTicketId(String(data.id));
      setForm({category:selected.id,title:'',description:'',location:'',reporterName:'',reporterPhone:'',reporterEmail:''});
      setPhotos([]); await loadTickets();
    } catch(err) { setNotice(`Could not submit the report. Check that the backend is running and its POST /api/tickets endpoint accepts these fields. ${err.message || ''}`); }
    finally { setBusy(false); }
  }
  async function trackComplaint(e) {
    e?.preventDefault(); setNotice('');
    try {
      const r = await fetch(`${API}/${encodeURIComponent(ticketId.trim())}`);
      if (!r.ok) throw new Error();
      setTracked(await r.json());
    } catch {
      const found = tickets.find(t=>String(t.id)===ticketId.trim());
      if (found) setTracked(found);
      else { setTracked(null); setNotice('We could not find that complaint. Check the ID or refresh your complaints.'); }
    }
  }
  const stats = useMemo(()=>({
    total:tickets.length,
    open:tickets.filter(t=>!['RESOLVED','CLOSED'].includes(t.status)).length,
    resolved:tickets.filter(t=>['RESOLVED','CLOSED'].includes(t.status)).length,
    urgent:tickets.filter(t=>['HIGH','URGENT'].includes(t.priority)).length
  }),[tickets]);
  const nav = (p)=>{setPage(p);setNotice('');if(p==='complaints')loadTickets();};
  const categoryPage = categories.some(c=>c.id===page);
  const pageTitle = categoryPage ? categories.find(c=>c.id===page)?.title : ({home:'Safer roads start with you',report:'Report an infrastructure issue',track:'Track your complaint',map:'Issue map & hotspots',complaints:'My complaints',about:'About this service'}[page] || 'Road & Infrastructure Care');

  return <div className="site">
    <header className="nav"><button className="brand" onClick={()=>nav('home')}><span className="brand-mark">RI</span><span><b>Road & Infrastructure Care</b><small>Report · Track · Improve</small></span></button>
      <nav>{[['home','Home'],['report','Report'],['track','Track'],['map','Map'],['complaints','My Complaints'],['about','About']].map(([p,l])=><button key={p} className={page===p?'active':''} onClick={()=>nav(p)}>{l}</button>)}</nav>
      <button className="nav-cta" onClick={()=>openReport()}>＋ Report issue</button>
    </header>

    {page==='home' && <>
      <section className="hero" style={{backgroundImage:"linear-gradient(90deg,rgba(7,20,42,.88),rgba(7,20,42,.22)),url('/images/home-road.jpg')"}}>
        <div className="hero-content"><span className="eyebrow">YOUR CITY. YOUR VOICE.</span><h1>Safer roads.<br/><em>Better neighbourhoods.</em></h1><p>See a pothole, blocked drain or broken streetlight? Report it in a few steps and follow the repair journey.</p>
          <div className="hero-actions"><button className="primary" onClick={()=>openReport()}>Report a problem <span>↗</span></button><button className="ghost" onClick={()=>nav('track')}>Track a complaint</button></div>
          <div className="hero-note"><span className="live-dot"></span> Every report helps your community move forward</div>
        </div>
      </section>
      <section className="stats-row"><div><b>{stats.total}</b><span>Reports received</span></div><div><b>{stats.open}</b><span>Being followed up</span></div><div><b>{stats.resolved}</b><span>Resolved reports</span></div><div><b>{stats.urgent}</b><span>High-priority issues</span></div></section>
      <section className="section"><div className="section-heading"><div><span className="eyebrow">CHOOSE A PROBLEM</span><h2>What needs attention?</h2><p>Select a category to open its dedicated page with guidance and a report form.</p></div><button className="text-btn" onClick={()=>nav('map')}>Explore issue map →</button></div>
        <div className="category-grid">{categories.map(c=><button key={c.id} className="category-card" onClick={()=>nav(c.id)} style={{backgroundImage:`linear-gradient(0deg,rgba(9,20,38,.93),rgba(9,20,38,.04) 85%),url('${c.image}')`}}><span className={`cat-icon ${c.color}`}>{c.icon}</span><span className="cat-title">{c.title}</span><span className="cat-link">View details <b>↗</b></span></button>)}</div>
      </section>
      <section className="how"><div><span className="eyebrow">SIMPLE. TRANSPARENT. LOCAL.</span><h2>From report to repair</h2><p>Follow each complaint through the repair process and check for updates whenever you need.</p></div><div className="how-steps">{[['01','Report','Share the issue, location and photos.'],['02','Review','The team verifies and assigns the work.'],['03','Repair','Track progress until the issue is resolved.']].map(x=><div key={x[0]}><i>{x[0]}</i><b>{x[1]}</b><p>{x[2]}</p></div>)}</div></section>
    </>}

    {page==='report' && <><PageHero title="Report an infrastructure issue" subtitle="A clear location and description help the right team respond faster." image="/images/report-pothole.jpg"/><main className="content two-col"><form className="panel form-panel" onSubmit={submitReport}><span className="eyebrow">NEW COMPLAINT</span><h2>Tell us what happened</h2>{notice&&<div className="notice">{notice}</div>}
      <label>Issue category *<select required value={form.category} onChange={e=>{setForm({...form,category:e.target.value});setSelected(categories.find(c=>c.id===e.target.value)||categories[0]);}}>{categories.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}</select></label>
      <label>Short title *<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Deep pothole near bus stop"/></label>
      <label>Description *<textarea required rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the issue and any safety concern…"/></label>
      <label>Exact location / landmark *<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Road name, area, nearby landmark"/></label>
      <div className="form-grid"><label>Your name *<input required value={form.reporterName} onChange={e=>setForm({...form,reporterName:e.target.value})} /></label><label>Phone<input value={form.reporterPhone} onChange={e=>setForm({...form,reporterPhone:e.target.value})} /></label></div>
      <label>Email<input type="email" value={form.reporterEmail} onChange={e=>setForm({...form,reporterEmail:e.target.value})} /></label>
      <label>Photos (optional)<input type="file" accept="image/*" multiple onChange={e=>setPhotos([...e.target.files].slice(0,5))}/><small className="help">Selected: {photos.map(p=>p.name).join(', ') || 'No photos selected'}. Photo storage requires backend upload support.</small></label>
      <button className="primary wide" disabled={busy}>{busy?'Submitting…':'Submit complaint →'}</button>
    </form><aside className="side-image" style={{backgroundImage:`linear-gradient(0deg,rgba(8,20,39,.92),rgba(8,20,39,.1)),url('${(categories.find(c=>c.id===form.category)||categories[0]).image}')`}}><div><span className="eyebrow">HELP US FIX IT</span><h3>{(categories.find(c=>c.id===form.category)||categories[0]).title}</h3><p>{(categories.find(c=>c.id===form.category)||categories[0]).text}</p><ul><li>Describe the location clearly</li><li>Include visible landmarks</li><li>Never enter a dangerous road to take a photo</li></ul></div></aside></main></>}

    {page==='track' && <><PageHero title="Track your complaint" subtitle="Enter the complaint number to see the latest available status." image="/images/track-road.jpg"/><main className="content narrow"><form className="track-box" onSubmit={trackComplaint}><label>Complaint ID<input required value={ticketId} onChange={e=>setTicketId(e.target.value)} placeholder="e.g. 108"/></label><button className="primary">Find complaint →</button></form>{notice&&<div className="notice">{notice}</div>}{tracked&&<div className="panel tracking"><div className="section-heading"><div><span className="eyebrow">COMPLAINT #{tracked.id}</span><h2>{tracked.title}</h2><p>{tracked.location}</p></div><span className="status">{pretty(tracked.status)}</span></div><div className="progress">{steps.map((s,i)=><div className={steps.indexOf(tracked.status)>=i?'step done':'step'} key={s}><i>{steps.indexOf(tracked.status)>=i?'✓':i+1}</i><b>{pretty(s)}</b></div>)}</div><p>{tracked.description}</p><p><b>Assigned staff:</b> {tracked.assignedTo||'Not assigned yet'}</p><p><b>Priority:</b> {tracked.priority||'Not set'}</p></div>}</main></>}

    {categoryPage && <><PageHero title={categories.find(c=>c.id===page).title} subtitle={categories.find(c=>c.id===page).text} image={categories.find(c=>c.id===page).image}/><main className="content category-detail"><div className="panel detail-panel"><span className="eyebrow">ISSUE GUIDE</span><h2>Help us understand the problem</h2><p>{categories.find(c=>c.id===page).text} Share the location and details so the maintenance team can assess the issue.</p><div className="tip-grid"><div><b>📍 Location</b><p>Add a road name or nearby landmark.</p></div><div><b>📝 Description</b><p>Explain the size, severity or safety impact.</p></div><div><b>📷 Evidence</b><p>Add photos if it is safe to do so.</p></div></div><button className="primary" onClick={()=>openReport(categories.find(c=>c.id===page))}>Report this problem →</button></div><div className="detail-photo" style={{backgroundImage:`url('${categories.find(c=>c.id===page).image}')`}}/></main></>}

    {page==='map' && <><PageHero title="Issue map & hotspots" subtitle="Browse reported issues and spot locations that may need attention." image="/images/map.jpg"/><main className="content"><div className="map-layout"><div className="panel"><span className="eyebrow">ISSUE LIST</span><h2>Reported locations</h2>{categories.map(c=><div className="map-key" key={c.id}><span>{c.icon}</span><div><b>{c.short}</b><small>{tickets.filter(t=>(t.category||'').toUpperCase().includes(c.id)).length} matching reports in loaded tickets</small></div><button onClick={()=>nav(c.id)}>Details ↗</button></div>)}</div><div className="map-panel"><div className="map-art"><span className="pin pin1">⚠️</span><span className="pin pin2">🌊</span><span className="pin pin3">💡</span><span className="pin pin4">🚧</span><div className="map-label">Issue locations preview</div></div><p className="help">Illustrative map preview. Live map pins require latitude/longitude fields and a map provider integration.</p></div></div></main></>}

    {page==='complaints' && <><PageHero title="My complaints" subtitle="Review reports currently available from the service." image="/images/complaints.jpg"/><main className="content"><div className="section-heading"><div><span className="eyebrow">REPORT HISTORY</span><h2>Complaint list</h2></div><button className="secondary" onClick={loadTickets}>↻ Refresh</button></div>{notice&&<div className="notice">{notice}</div>}<div className="panel table-wrap"><table><thead><tr><th>ID</th><th>Issue</th><th>Location</th><th>Status</th><th>Priority</th><th></th></tr></thead><tbody>{tickets.map(t=><tr key={t.id}><td>#{t.id}</td><td>{t.title}</td><td>{t.location}</td><td><span className="status">{pretty(t.status)}</span></td><td>{t.priority||'—'}</td><td><button className="text-btn" onClick={()=>{setTicketId(String(t.id));setTracked(t);nav('track')}}>Track →</button></td></tr>)}</tbody></table>{tickets.length===0&&<p className="empty">No complaints were returned by the backend yet.</p>}</div><p className="help">This page lists reports returned by the API. Personal-only complaint filtering requires user authentication or a reporter identifier on the backend.</p></main></>}

    {page==='about' && <><PageHero title="A better way to care for our roads" subtitle="A community-focused service connecting public reports with infrastructure teams." image="/images/home-road.jpg"/><main className="content"><div className="panel detail-panel"><h2>Report · Track · Improve</h2><p>Use this portal to report road damage and public infrastructure concerns, provide location details, and follow status updates when they are available.</p><div className="tip-grid"><div><b>Community powered</b><p>Residents can help identify issues early.</p></div><div><b>Clear progress</b><p>Complaint status makes follow-up easier.</p></div><div><b>Location aware</b><p>Specific landmarks help teams find the issue.</p></div></div><button className="primary" onClick={()=>openReport()}>Start a report →</button></div></main></>}
    <footer><b>RI · ROAD & INFRASTRUCTURE CARE</b><span>Report · Track · Improve</span><button onClick={()=>nav('home')}>Back to top ↑</button></footer>
  </div>;
}
function PageHero({title,subtitle,image}) { return <section className="page-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(8,20,39,.9),rgba(8,20,39,.28)),url('${image}')`}}><div><span className="eyebrow">ROAD & INFRASTRUCTURE CARE</span><h1>{title}</h1><p>{subtitle}</p></div></section>; }
