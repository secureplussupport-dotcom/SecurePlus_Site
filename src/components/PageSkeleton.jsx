import './PageSkeleton.css';
const titles={dashboard:'Dashboard',mcq:'MCQ setup',flashcards:'Flashcard shelf','deep-dives':'Lesson index',pricing:'Pro passes','study-plan':'Study plan'};
export function PageSkeleton({view='dashboard',overlay=false,t}){
 const type=titles[view]?view:'dashboard';
 return <div className={`page-skeleton ps-${type} ${overlay?'ps-overlay':''}`} role="status" aria-label={`Loading ${titles[type]}`} aria-busy="true" style={t?{background:t.bg,color:t.text}:undefined}><div className="ps-layout"><span className="ps-caption">Loading {titles[type]}…</span><div className="ps-heading"/>{type==='dashboard'?<><div className="ps-hero"><div/><div className="ps-circle"/></div><div className="ps-grid">{[1,2,3,4].map(n=><div key={n}/>)}</div></>:type==='mcq'?<><div className="ps-pills"><i/><i/></div><div className="ps-practice"/><div className="ps-grid">{[1,2,3].map(n=><div key={n}/>)}</div></>:type==='pricing'?<div className="ps-hero"><div/><div/></div>:<><div className="ps-pills"><i/><i/><i/></div><div className="ps-grid">{[1,2,3,4,5,6].map(n=><div key={n}/>)}</div></>}</div></div>;
}
