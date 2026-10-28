import {ChevronRight} from 'lucide-react';
import {areaName,canonicalArea} from '../lib/navigationLabels.js';
import './ViewBreadcrumb.css';

export function ViewBreadcrumb({view,guest=false,onNavigate,t}){
 if(canonicalArea(view)==='dashboard')return null;
 return <nav className="view-breadcrumb" aria-label="Breadcrumb" style={{'--location-text':t.text,'--location-muted':t.textSec,'--location-line':t.border,'--location-accent':t.accent||t.green}}><ol><li><button type="button" onClick={()=>onNavigate('dashboard')}>{areaName('dashboard',guest)}</button></li><li><ChevronRight size={14} aria-hidden="true"/><span aria-current="page">{areaName(view,guest)}</span></li></ol></nav>;
}
