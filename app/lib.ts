const root='https://api.themoviedb.org/3';
export async function tmdb(path:string, params:Record<string,string>={}) {
 const token=process.env.TMDB_READ_ACCESS_TOKEN;
 if(!token) return {error:'Movie catalog is not configured yet.'};
 const u=new URL(root+path); Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
 const r=await fetch(u,{headers:{Authorization:`Bearer ${token}`},next:{revalidate:1800}});
 if(!r.ok) return {error:`Movie service returned ${r.status}`}; return r.json();
}
