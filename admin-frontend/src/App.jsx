import { useEffect, useMemo, useState } from 'react';
import './style.css';

const API = 'http://localhost:8081/api/tickets';
const STATUSES = ['OPEN', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const str = v => v == null ? '' : String(v);
const parsedDate = v => { if (!v) return null; const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; };
const overdue = t => { const d = parsedDate(t.dueDate || t.deadline); return d && !['RESOLVED','CLOSED'].includes(t.status) && d < new Date(); };

function App() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('ri_admin_session') === 'yes');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('tickets');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [photoTicket, setPhotoTicket] = useState(null);
  const [beforePhoto, setBeforePhoto] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');

  function login(e) {
    e.preventDefault();
    if (credentials.email.trim().toLowerCase() === 'admin@roadinfra.in' && credentials.password === 'Admin@123') {
      sessionStorage.setItem('ri_admin_session', 'yes'); setLoggedIn(true); setMessage('Admin login successful.');
    } else setMessage('Invalid admin credentials. Use the demo credentials shown below.');
  }
  async function load() {
    setLoading(true);
    try { const r = await fetch(API); if (!r.ok) throw new Error(); const data = await r.json(); setTickets(Array.isArray(data) ? data : []); setMessage(''); }
    catch { setMessage('Cannot connect to backend. Start Spring Boot on port 8081 and check MySQL settings.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (loggedIn) load(); }, [loggedIn]);

  async function patch(id, endpoint, body, success) {
    try {
      const r = await fetch(`${API}/${id}/${endpoint}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(); setMessage(success || 'Ticket updated.'); await load();
    } catch { setMessage('Could not update ticket. This feature may need a matching Spring Boot endpoint.'); }
  }
  const updateStatus = (id, status, assignedTo) => patch(id, 'status', { status, ...(assignedTo !== undefined ? { assignedTo } : {}) }, 'Ticket status updated.');
  const updatePriority = (id, priority) => patch(id, 'priority', { priority }, 'Ticket priority updated.');

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => ['OPEN','VERIFIED'].includes(t.status)).length,
    progress: tickets.filter(t => ['ASSIGNED','IN_PROGRESS'].includes(t.status)).length,
    resolved: tickets.filter(t => ['RESOLVED','CLOSED'].includes(t.status)).length,
    overdue: tickets.filter(overdue).length,
    urgent: tickets.filter(t => ['HIGH','URGENT'].includes(t.priority) && !['RESOLVED','CLOSED'].includes(t.status)).length
  }), [tickets]);
  const staffList = useMemo(() => [...new Set(tickets.map(t => str(t.assignedTo).trim()).filter(Boolean))].sort(), [tickets]);
  const locations = useMemo(() => [...new Set(tickets.map(t => str(t.location).trim()).filter(Boolean))].sort(), [tickets]);
  const filtered = useMemo(() => tickets.filter(t => {
    const q = search.trim().toLowerCase();
    const searchable = [t.id,t.title,t.category,t.location,t.description,t.reporterName,t.assignedTo].map(str).join(' ').toLowerCase();
    return (!q || searchable.includes(q)) && (statusFilter === 'ALL' || t.status === statusFilter) &&
      (priorityFilter === 'ALL' || t.priority === priorityFilter) &&
      (!locationFilter || str(t.location).toLowerCase().includes(locationFilter.toLowerCase())) &&
      (!staffFilter || str(t.assignedTo).toLowerCase().includes(staffFilter.toLowerCase()));
  }), [tickets, search, statusFilter, priorityFilter, locationFilter, staffFilter]);

  function exportCsv() {
    const cols = ['id','title','category','location','description','reporterName','reporterPhone','reporterEmail','priority','status','assignedTo','dueDate','createdAt','resolvedAt'];
    const cell = v => `"${str(v).replace(/"/g, '""')}"`;
    const csv = [cols, ...filtered.map(t => cols.map(k => t[k] ?? ''))].map(row => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'road-infrastructure-tickets.csv'; a.click(); URL.revokeObjectURL(url);
  }
  function logout() { sessionStorage.removeItem('ri_admin_session'); setLoggedIn(false); setTickets([]); setMessage('Logged out.'); }
  function previewPhoto(file, setter) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage('Please choose an image file.'); return; }
    setter(URL.createObjectURL(file));
  }

  return <main className="shell">
    <header className="top"><div className="brand"><div className="logo">RI</div><div><div className="eyebrow">CIVIC INFRASTRUCTURE</div><h1>Road & Infrastructure Care</h1></div></div><span className="pill">ADMIN CONSOLE</span></header>
    {!loggedIn ? <>
      <section className="hero"><div><p className="eyebrow">AUTHORIZED STAFF ONLY</p><h2>Admin sign in<br/>for ticket management.</h2><p className="muted">Review citizen reports, assign maintenance staff, set priorities, and update issue status.</p></div><div className="heroMark">⌁</div></section>
      {message && <div className="notice">{message}</div>}
      <section className="layout"><div className="panel"><div className="sectionTitle"><div><p className="eyebrow">ADMIN ACCESS</p><h3>Administrator login</h3></div><span className="step">SIGN IN</span></div>
        <form className="form" onSubmit={login}><label>Admin email<input required type="email" autoComplete="username" value={credentials.email} onChange={e => setCredentials({...credentials,email:e.target.value})} placeholder="admin@roadinfra.in"/></label><label>Password<input required type="password" autoComplete="current-password" value={credentials.password} onChange={e => setCredentials({...credentials,password:e.target.value})} placeholder="Enter admin password"/></label><button className="primary">Log in to admin console <span>↗</span></button></form>
        <div className="tip" style={{marginTop:18}}><b>Demo login</b><p>Email: admin@roadinfra.in<br/>Password: Admin@123</p></div></div>
        <div className="panel side"><p className="eyebrow">ADMIN TOOLS</p><h3>Manage public reports</h3><div className="timeline"><div><i>1</i><section><b>Review tickets</b><p>Check reporter contact information and issue location.</p></section></div><div><i>2</i><section><b>Assign a team</b><p>Record the staff member responsible for follow-up.</p></section></div><div><i>3</i><section><b>Track repairs</b><p>Monitor deadlines, progress, and completed work.</p></section></div></div></div></section>
    </> : <>
      <section className="hero"><div><p className="eyebrow">OPERATIONS DASHBOARD</p><h2>Resolve issues.<br/>Improve public spaces.</h2><p className="muted">Assign staff, monitor overdue repairs, inspect locations, and report outcomes.</p></div><button className="secondary" onClick={logout}>Log out</button></section>
      {message && <div className="notice">{message}</div>}
      <section className="stats"><div className="stat"><span>Total tickets</span><strong>{stats.total}</strong></div><div className="stat"><span>Open / verified</span><strong>{stats.open}</strong></div><div className="stat"><span>Assigned / in progress</span><strong>{stats.progress}</strong></div><div className="stat"><span>Resolved / closed</span><strong>{stats.resolved}</strong></div><div className="stat"><span>Overdue</span><strong>{stats.overdue}</strong></div><div className="stat"><span>High / urgent pending</span><strong>{stats.urgent}</strong></div></section>
      <nav className="adminTabs"><button className={tab==='tickets'?'tab active':'tab'} onClick={()=>setTab('tickets')}>Complaints & repairs</button><button className={tab==='map'?'tab active':'tab'} onClick={()=>setTab('map')}>Map & locations</button><button className={tab==='analytics'?'tab active':'tab'} onClick={()=>setTab('analytics')}>Reports & analytics</button></nav>
      {tab==='tickets' && <section className="panel"><div className="sectionTitle"><div><p className="eyebrow">OPERATIONS</p><h3>Complaint management</h3></div><div className="toolbarButtons"><button className="secondary" onClick={load}>↻ Refresh</button><button className="primary smallButton" onClick={exportCsv}>Export CSV ↓</button></div></div>
        <div className="filters"><input aria-label="Search tickets" placeholder="Search ticket, road, reporter…" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Filter status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="ALL">All statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select><select aria-label="Filter priority" value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}><option value="ALL">All priorities</option>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select><select aria-label="Filter staff" value={staffFilter} onChange={e=>setStaffFilter(e.target.value)}><option value="">All staff</option>{staffList.map(s=><option key={s}>{s}</option>)}</select><input aria-label="Filter location" placeholder="Filter location…" value={locationFilter} onChange={e=>setLocationFilter(e.target.value)}/></div>
        <div className="tableWrap"><table><thead><tr><th>Ticket</th><th>Issue / location</th><th>Reporter details</th><th>Priority</th><th>Status</th><th>Assigned staff</th><th>Deadline</th><th>Repair photos</th></tr></thead><tbody>
          {filtered.map(t=><tr key={t.id}><td><b>#{t.id}</b><small>{t.category||'Issue'}</small></td><td><b>{t.title||'Untitled issue'}</b><small>{t.location||'Location not provided'}</small><small>{t.description}</small>{t.latitude!=null&&t.longitude!=null&&<small>GPS: {t.latitude}, {t.longitude}</small>}</td><td>{t.reporterName||'Unknown'}<small>{t.reporterPhone||'Phone not provided'}</small><small>{t.reporterEmail||''}</small></td>
          <td><select className="compact" value={t.priority||'MEDIUM'} onChange={e=>updatePriority(t.id,e.target.value)}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></td>
          <td><select className="compact" value={t.status||'OPEN'} onChange={e=>updateStatus(t.id,e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select><small>{t.resolvedAt?`Resolved: ${new Date(t.resolvedAt).toLocaleDateString()}`:''}</small></td>
          <td><input className="compact" placeholder="Staff name" defaultValue={t.assignedTo||''} onBlur={e=>{if(e.target.value!==(t.assignedTo||''))updateStatus(t.id,t.status||'OPEN',e.target.value)}}/><small>{overdue(t)?<span className="overdueText">OVERDUE</span>:(t.dueDate||t.deadline?`Due ${new Date(t.dueDate||t.deadline).toLocaleDateString()}`:'No deadline recorded')}</small></td>
          <td><input className="compact" type="date" aria-label={`Deadline for ticket ${t.id}`} defaultValue={(t.dueDate||t.deadline||'').slice(0,10)} onBlur={e=>{if(e.target.value&&e.target.value!==(t.dueDate||t.deadline||'').slice(0,10))patch(t.id,'deadline',{dueDate:e.target.value},'Deadline update sent.')}}/><small>Needs backend deadline endpoint</small></td>
          <td><button className="secondary miniButton" onClick={()=>{setPhotoTicket(t);setBeforePhoto(t.beforePhotoUrl||'');setAfterPhoto(t.afterPhotoUrl||'')}}>View / add</button></td></tr>)}
        </tbody></table>{!loading&&filtered.length===0&&<div className="empty">No tickets match these filters.</div>}{loading&&<div className="empty">Loading tickets…</div>}</div>
      </section>}
      {tab==='map' && <section className="panel"><div className="sectionTitle"><div><p className="eyebrow">GEOGRAPHIC OVERVIEW</p><h3>Reported issue locations</h3></div><span className="step">{locations.length} locations</span></div><p className="muted">Exact map pins need latitude and longitude in ticket records. Text locations are summarized below.</p>
        <div className="mapGrid"><div className="mapCanvas">{tickets.some(t=>t.latitude!=null&&t.longitude!=null)?(()=>{const pts=tickets.filter(t=>t.latitude!=null&&t.longitude!=null);const lons=pts.map(t=>Number(t.longitude)),lats=pts.map(t=>Number(t.latitude));const bbox=[Math.min(...lons)-.01,Math.min(...lats)-.01,Math.max(...lons)+.01,Math.max(...lats)+.01].join('%2C');return <iframe title="Reported issue map" width="100%" height="420" style={{border:0,borderRadius:12}} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}/>})():<div className="mapPlaceholder"><span>⌖</span><b>GPS coordinates not available yet</b><p>Add latitude and longitude fields to tickets to display exact issue pins.</p></div>}</div>
        <div className="locationList"><h4>Location summary</h4>{locations.length?locations.map(loc=>{const ts=tickets.filter(t=>str(t.location).trim()===loc);return <div className="locationItem" key={loc}><b>{loc}</b><span>{ts.length} report{ts.length===1?'':'s'}</span><small>{ts.filter(t=>!['RESOLVED','CLOSED'].includes(t.status)).length} pending · {ts.filter(t=>['HIGH','URGENT'].includes(t.priority)).length} high priority</small></div>}):<p className="muted">No locations recorded yet.</p>}</div></div>
        <h4>Tickets with GPS coordinates</h4><div className="tableWrap"><table><thead><tr><th>Ticket</th><th>Location</th><th>Coordinates</th><th>Issue</th><th>Status</th></tr></thead><tbody>{tickets.filter(t=>t.latitude!=null&&t.longitude!=null).map(t=><tr key={t.id}><td>#{t.id}</td><td>{t.location}</td><td>{t.latitude}, {t.longitude}</td><td>{t.title}</td><td>{t.status}</td></tr>)}</tbody></table></div>
      </section>}
      {tab==='analytics' && <section className="panel"><div className="sectionTitle"><div><p className="eyebrow">PERFORMANCE</p><h3>Reports & analytics</h3></div><button className="primary smallButton" onClick={exportCsv}>Export filtered CSV ↓</button></div>
        <div className="analyticsGrid"><div className="analyticsCard"><span>Resolution rate</span><strong>{stats.total?Math.round(stats.resolved/stats.total*100):0}%</strong><div className="bar"><i style={{width:`${stats.total?stats.resolved/stats.total*100:0}%`}}/></div></div><div className="analyticsCard"><span>Pending workload</span><strong>{tickets.filter(t=>!['RESOLVED','CLOSED'].includes(t.status)).length}</strong><small>All unresolved reports</small></div><div className="analyticsCard"><span>Overdue tickets</span><strong>{stats.overdue}</strong><small>Requires deadline field</small></div><div className="analyticsCard"><span>Staff assigned</span><strong>{staffList.length}</strong><small>Unique staff names</small></div></div>
        <div className="analyticsColumns"><div><h4>Most reported locations</h4>{locations.map(loc=>({loc,count:tickets.filter(t=>str(t.location).trim()===loc).length})).sort((a,b)=>b.count-a.count).slice(0,8).map(x=><div className="rankRow" key={x.loc}><span>{x.loc}</span><b>{x.count}</b></div>)}{!locations.length&&<p className="muted">No location data yet.</p>}</div><div><h4>Complaints by status</h4>{STATUSES.map(s=><div className="rankRow" key={s}><span>{s.replace('_',' ')}</span><b>{tickets.filter(t=>t.status===s).length}</b></div>)}</div><div><h4>Pending work by staff</h4>{staffList.map(s=><div className="rankRow" key={s}><span>{s}</span><b>{tickets.filter(t=>t.assignedTo===s&&!['RESOLVED','CLOSED'].includes(t.status)).length} pending</b></div>)}{!staffList.length&&<p className="muted">Assign staff to tickets to see workload.</p>}</div></div>
        <p className="tip">CSV export works with loaded ticket data. Monthly/yearly summaries and PDF export need a reporting endpoint or PDF library.</p>
      </section>}
    </>}
    {photoTicket && <div className="modalBackdrop" onClick={e=>{if(e.target===e.currentTarget)setPhotoTicket(null)}}><section className="panel photoModal" role="dialog" aria-modal="true" aria-labelledby="photoTitle"><div className="sectionTitle"><div><p className="eyebrow">REPAIR EVIDENCE</p><h3 id="photoTitle">Ticket #{photoTicket.id} photos</h3></div><button className="secondary" onClick={()=>setPhotoTicket(null)}>Close</button></div><p className="muted">Images are previewed in this browser only. Permanent storage requires a backend upload endpoint.</p><div className="photoGrid"><label>Before repair<input type="file" accept="image/*" onChange={e=>previewPhoto(e.target.files?.[0],setBeforePhoto)}/>{beforePhoto&&<img src={beforePhoto} alt="Before repair preview"/>}</label><label>After repair<input type="file" accept="image/*" onChange={e=>previewPhoto(e.target.files?.[0],setAfterPhoto)}/>{afterPhoto&&<img src={afterPhoto} alt="After repair preview"/>}</label></div><div className="tip">Add multipart upload and status-history endpoints in Spring Boot to save evidence permanently and audit repair changes.</div></section></div>}
    <section className="footer"><span>ROAD INFRASTRUCTURE CARE</span><span>Secure admin authentication is required before deployment.</span></section>
  </main>;
}
export default App;
