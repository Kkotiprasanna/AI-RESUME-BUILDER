import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { request, token } from './api';

const blank = () => ({
  title: 'My Resume', template: 'modern',
  personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', website: '', role: '' },
  summary: '', education: [{ school: '', degree: '', year: '', details: '' }],
  experience: [{ company: '', role: '', duration: '', description: '' }],
  skills: [], projects: [{ name: '', description: '', link: '' }]
});
function Protected({ children }) { return token() ? children : <Navigate to="/login" replace />; }
function Auth({ mode }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault(); setError('');
    try {
      const data = await request(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('arb_token', data.token); localStorage.setItem('arb_user', JSON.stringify(data.user));
      navigate('/');
    } catch (e) { setError(e.message); }
  }
  return <main className="auth-wrap"><form className="auth-card" onSubmit={submit}>
    <div className="brand-mark">AR</div><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
    <p className="muted">AI-powered resumes that help you stand out.</p>
    {mode === 'register' && <label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}
    <label>Email address<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
    <label>Password<input type="password" minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
    {error && <p className="error">{error}</p>}<button className="primary full">{mode === 'login' ? 'Log in' : 'Create account'}</button>
    <p className="muted center">{mode === 'login' ? "Don't have an account?" : 'Already registered?'} <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Sign up' : 'Log in'}</Link></p>
  </form></main>;
}
function Dashboard() {
  const [resumes,setResumes]=useState([]),[error,setError]=useState('');
  const navigate=useNavigate(); const user=JSON.parse(localStorage.getItem('arb_user')||'{}');
  async function load(){try{setResumes(await request('/resumes'));}catch(e){setError(e.message);}}
  useEffect(()=>{load();},[]);
  async function create(){try{const r=await request('/resumes',{method:'POST',body:JSON.stringify(blank())});navigate(`/editor/${r._id}`);}catch(e){setError(e.message);}}
  async function remove(id){if(!confirm('Delete this resume?'))return;try{await request(`/resumes/${id}`,{method:'DELETE'});load();}catch(e){setError(e.message);}}
  function logout(){localStorage.clear();navigate('/login');}
  return <div className="shell"><header className="topbar"><Link className="logo" to="/"> <span>AR</span> ResumeCraft</Link><div className="top-actions"><span className="muted">Hi, {user.name||'there'}</span><button className="outline small" onClick={logout}>Log out</button></div></header>
    <main className="container"><div className="hero-row"><div><p className="eyebrow">YOUR CAREER WORKSPACE</p><h1>Build a resume that opens doors.</h1><p className="muted">Create, improve and manage your professional story.</p></div><button className="primary" onClick={create}>＋ Create new resume</button></div>
    {error&&<p className="error">{error}</p>}<h2 className="section-title">Your resumes <span className="count">{resumes.length}</span></h2>
    {resumes.length===0?<div className="empty"><div className="empty-icon">✦</div><h3>Your next opportunity starts here</h3><p className="muted">Create your first resume and use AI to polish your content.</p><button className="primary" onClick={create}>Create my first resume</button></div>:
    <div className="resume-grid">{resumes.map(r=><article className="resume-card" key={r._id}><div className="doc-icon">▤</div><h3>{r.title||'Untitled resume'}</h3><p className="muted">{r.personal?.role||'Add your target role'}</p><p className="tiny muted">Updated {new Date(r.updatedAt).toLocaleDateString()}</p><div className="card-actions"><button className="primary small" onClick={()=>navigate(`/editor/${r._id}`)}>Edit resume</button><button className="outline small" onClick={()=>remove(r._id)}>Delete</button></div></article>)}</div>}
    </main></div>;
}
function Field({label,value,onChange,placeholder='',type='text'}){return <label>{label}<input type={type} value={value||''} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/></label>}
function Section({title,children,action}){return <section className="form-section"><div className="section-head"><h3>{title}</h3>{action}</div>{children}</section>}
function Editor(){
 const {id}=useParams(),navigate=useNavigate();const [data,setData]=useState(blank()),[saving,setSaving]=useState(false),[notice,setNotice]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{request(`/resumes/${id}`).then(setData).catch(e=>setNotice(e.message)).finally(()=>setLoading(false));},[id]);
 const update=(key,val)=>setData(d=>({...d,[key]:val}));
 const personal=(key,val)=>setData(d=>({...d,personal:{...d.personal,[key]:val}}));
 const listUpdate=(key,index,field,val)=>setData(d=>({...d,[key]:d[key].map((item,i)=>i===index?{...item,[field]:val}:item)}));
 const add=(key,empty)=>update(key,[...data[key],empty]);
 const remove=(key,index)=>update(key,data[key].filter((_,i)=>i!==index));
 async function save(){setSaving(true);setNotice('');try{await request(`/resumes/${id}`,{method:'PUT',body:JSON.stringify(data)});setNotice('Saved successfully.');}catch(e){setNotice(e.message);}finally{setSaving(false);}}
 async function improve(type,index=null){
   const source=type==='summary'?data.summary:data.experience[index].description;
   if(!source.trim()){setNotice('Add some text before asking AI to improve it.');return;}
   setNotice('AI is working…');
   try{const out=await request('/ai/improve',{method:'POST',body:JSON.stringify({text:source,type,role:data.personal.role})});
    if(type==='summary')update('summary',out.text);else listUpdate('experience',index,'description',out.text);
    setNotice(out.mode==='demo-fallback'?'Improved with demo mode. Add a Gemini API key for live AI.':'AI improvement complete.');
   }catch(e){setNotice(e.message);}
 }
 if(loading)return <div className="loading">Loading resume…</div>;
 return <div className="shell"><header className="topbar"><Link className="logo" to="/"> <span>AR</span> ResumeCraft</Link><div className="top-actions"><button className="outline small" onClick={()=>navigate('/')}>Dashboard</button><button className="primary small" onClick={save} disabled={saving}>{saving?'Saving…':'Save changes'}</button></div></header>
 <main className="editor-layout"><div className="editor-panel"><div className="editor-heading"><p className="eyebrow">RESUME EDITOR</p><h1>Tell your story.</h1><p className="muted">Your changes appear in the preview.</p></div>
 {notice&&<div className="notice">{notice}</div>}
 <Section title="Resume details"><Field label="Resume title" value={data.title} onChange={v=>update('title',v)}/><label>Template<select value={data.template} onChange={e=>update('template',e.target.value)}><option value="modern">Modern</option><option value="classic">Classic</option></select></label></Section>
 <Section title="Personal information"><div className="fields two"><Field label="Full name" value={data.personal.fullName} onChange={v=>personal('fullName',v)}/><Field label="Professional title" value={data.personal.role} onChange={v=>personal('role',v)} placeholder="e.g. Frontend Developer"/><Field label="Email" type="email" value={data.personal.email} onChange={v=>personal('email',v)}/><Field label="Phone" value={data.personal.phone} onChange={v=>personal('phone',v)}/><Field label="Location" value={data.personal.location} onChange={v=>personal('location',v)}/><Field label="LinkedIn URL" value={data.personal.linkedin} onChange={v=>personal('linkedin',v)}/><Field label="Portfolio / website" value={data.personal.website} onChange={v=>personal('website',v)}/></div></Section>
 <Section title="Professional summary"><textarea rows="5" value={data.summary} placeholder="Write a short introduction about your experience, strengths and career goals…" onChange={e=>update('summary',e.target.value)}/><button className="ai-button" onClick={()=>improve('summary')}>✦ Improve with AI</button></Section>
 <Section title="Education" action={<button className="text-button" onClick={()=>add('education',{school:'',degree:'',year:'',details:''})}>＋ Add education</button>}>
 {data.education.map((x,i)=><div className="repeat-box" key={i}><div className="fields two"><Field label="Institution" value={x.school} onChange={v=>listUpdate('education',i,'school',v)}/><Field label="Degree / course" value={x.degree} onChange={v=>listUpdate('education',i,'degree',v)}/><Field label="Year" value={x.year} onChange={v=>listUpdate('education',i,'year',v)}/><Field label="Details" value={x.details} onChange={v=>listUpdate('education',i,'details',v)}/></div>{data.education.length>1&&<button className="remove" onClick={()=>remove('education',i)}>Remove</button>}</div>)}</Section>
 <Section title="Work experience" action={<button className="text-button" onClick={()=>add('experience',{company:'',role:'',duration:'',description:''})}>＋ Add experience</button>}>
 {data.experience.map((x,i)=><div className="repeat-box" key={i}><div className="fields two"><Field label="Company" value={x.company} onChange={v=>listUpdate('experience',i,'company',v)}/><Field label="Job title" value={x.role} onChange={v=>listUpdate('experience',i,'role',v)}/><Field label="Duration" value={x.duration} onChange={v=>listUpdate('experience',i,'duration',v)}/></div><label>Description<textarea rows="3" value={x.description} onChange={e=>listUpdate('experience',i,'description',e.target.value)}/></label><button className="ai-button" onClick={()=>improve('experience',i)}>✦ Improve description with AI</button>{data.experience.length>1&&<button className="remove" onClick={()=>remove('experience',i)}>Remove</button>}</div>)}</Section>
 <Section title="Skills"><label>Skills (separate with commas)<input value={data.skills.join(', ')} placeholder="JavaScript, React, Communication…" onChange={e=>update('skills',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}/></label></Section>
 <Section title="Projects" action={<button className="text-button" onClick={()=>add('projects',{name:'',description:'',link:''})}>＋ Add project</button>}>
 {data.projects.map((x,i)=><div className="repeat-box" key={i}><Field label="Project name" value={x.name} onChange={v=>listUpdate('projects',i,'name',v)}/><label>Description<textarea rows="2" value={x.description} onChange={e=>listUpdate('projects',i,'description',e.target.value)}/></label><Field label="Project link" value={x.link} onChange={v=>listUpdate('projects',i,'link',v)}/>{data.projects.length>1&&<button className="remove" onClick={()=>remove('projects',i)}>Remove</button>}</div>)}</Section>
 <button className="primary full save-bottom" onClick={save} disabled={saving}>{saving?'Saving…':'Save resume'}</button>
 </div><aside className="preview-panel"><div className="preview-toolbar"><div><p className="eyebrow">LIVE PREVIEW</p><strong>{data.title}</strong></div><button className="primary small" onClick={()=>window.print()}>↓ Download PDF</button></div><ResumePreview data={data}/><p className="tiny muted preview-tip">Tip: Use your browser's print dialog and choose “Save as PDF”.</p></aside></main></div>;
}
function ResumePreview({data:d}){
 const p=d.personal||{};
 return <article className={`resume-paper ${d.template}`} id="resume-paper">
 <div className="paper-header"><h1>{p.fullName||'Your Name'}</h1><h2>{p.role||'Professional Title'}</h2><p>{[p.email,p.phone,p.location,p.linkedin,p.website].filter(Boolean).join('  ·  ')||'Email · Phone · Location'}</p></div>
 {d.summary&&<div className="paper-section"><h3>PROFILE</h3><p>{d.summary}</p></div>}
 {d.experience?.some(x=>x.company||x.role||x.description)&&<div className="paper-section"><h3>EXPERIENCE</h3>{d.experience.map((x,i)=>(x.company||x.role||x.description)&&<div className="paper-item" key={i}><div className="paper-line"><strong>{x.role||'Position'}</strong><span>{x.duration}</span></div><em>{x.company}</em><p>{x.description}</p></div>)}</div>}
 {d.education?.some(x=>x.school||x.degree)&&<div className="paper-section"><h3>EDUCATION</h3>{d.education.map((x,i)=>(x.school||x.degree)&&<div className="paper-item" key={i}><div className="paper-line"><strong>{x.degree}</strong><span>{x.year}</span></div><p>{x.school} {x.details&&`· ${x.details}`}</p></div>)}</div>}
 {d.skills?.length>0&&<div className="paper-section"><h3>SKILLS</h3><p>{d.skills.join('  ·  ')}</p></div>}
 {d.projects?.some(x=>x.name||x.description)&&<div className="paper-section"><h3>PROJECTS</h3>{d.projects.map((x,i)=>(x.name||x.description)&&<div className="paper-item" key={i}><strong>{x.name}</strong><p>{x.description}</p>{x.link&&<small>{x.link}</small>}</div>)}</div>}
 </article>;
}
export default function App(){return <Routes><Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/><Route path="/" element={<Protected><Dashboard/></Protected>}/><Route path="/editor/:id" element={<Protected><Editor/></Protected>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
