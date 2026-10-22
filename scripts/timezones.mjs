// Derive both the graphic and table from IANA zones, checked by Intl.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
export const zones=[['Kenya','Africa/Nairobi',3,3],['USA Eastern','America/New_York',-5,-4],['USA Pacific','America/Los_Angeles',-8,-7],['Canada Eastern','America/Toronto',-5,-4],['UK','Europe/London',0,1],['Nigeria','Africa/Lagos',1,1]];
function offset(zone,date) {
 const part=new Intl.DateTimeFormat('en',{timeZone:zone,timeZoneName:'longOffset'}).formatToParts(date).find(p=>p.type==='timeZoneName').value;
 if(part==='GMT')return 0;
 const match=part.match(/GMT([+-])(\d{2}):(\d{2})/);assert(match,'Unexpected offset '+part);return (match[1]==='-'?-1:1)*(Number(match[2])+Number(match[3])/60);
}
export function rows(){return zones.map(([name,zone,winter,summer])=>{
 for(const [month,expected] of [[0,winter],[6,summer]])assert.equal(offset(zone,new Date(Date.UTC(2026,month,15,12))),expected,zone+' UTC offset');
 return {name,zone,seasons:[winter,summer].map((hours,i)=>{
  const start=9-hours,end=17-hours,commonStart=Math.max(6,start),commonEnd=Math.min(14,end),duration=Math.max(0,commonEnd-commonStart);
  return {season:i?'Summer':'Winter',offset:hours,start,end,duration,commonStart,commonEnd};
 })};});}
const hour=h=>String((h%24+24)%24).padStart(2,'0')+':00';
export function overlapText(s){return s.duration?`${s.duration} ${s.duration===1?'hour':'hours'}: ${hour(s.commonStart+3)} to ${hour(s.commonEnd+3)} Kenya, ${hour(s.commonStart+s.offset)} to ${hour(s.commonEnd+s.offset)} local`:'No overlap between the two 09:00 to 17:00 days';}
export function markup(){
 const data=rows();
 let graphic='<figure class="overlap-graphic"><figcaption>Working days on a 24-hour UTC axis. Grey is the local 09:00 to 17:00 day. Blue is the part shared with Kenya’s 09:00 to 17:00 day. Winter uses January offsets; summer uses July offsets.</figcaption><div aria-hidden="true"><div class="overlap-row"><span>UTC hours</span><div class="overlap-axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div></div>';
 for(const row of data)for(const s of row.seasons){if(row.name==='Kenya'&&s.season==='Summer')continue;
  graphic+='<div class="overlap-row"><span>'+row.name+(row.name==='Kenya'?'':': '+s.season.toLowerCase())+'</span><div class="overlap-track">';
  for(let h=s.start;h<s.end;h++){const column=(h%24+24)%24+1;graphic+=`<span class="overlap-day" style="grid-column:${column}"></span>`;}
  for(let h=s.commonStart;h<s.commonEnd;h++)graphic+=`<span class="overlap-common" style="grid-column:${h+1}"></span>`;
  graphic+='</div></div>';
 }
 graphic+='</div></figure><div class="table-scroll" tabindex="0" role="region" aria-label="Time zone overlap table"><table><caption>Normal 09:00 to 17:00 working days compared with Kenya, UTC+3. Eastern examples use New York and Toronto; Pacific uses Los Angeles.</caption><thead><tr><th scope="col">Location</th><th scope="col">Season and UTC offset</th><th scope="col">Kenya’s day in local time</th><th scope="col">Shared working hours</th></tr></thead><tbody>';
 for(const row of data.filter(r=>r.name!=='Kenya'))for(const s of row.seasons)graphic+='<tr><th scope="row">'+row.name+'</th><td>'+s.season+', UTC'+(s.offset>=0?'+':'')+s.offset+'</td><td>'+hour(6+s.offset)+(6+s.offset<0?' (previous day)':'')+' to '+hour(14+s.offset)+'</td><td>'+overlapText(s)+'</td></tr>';
 return graphic+'</tbody></table></div>';
}
if(process.argv[1]===fileURLToPath(import.meta.url))for(const row of rows())for(const s of row.seasons)console.log(`${row.name} ${s.season}: UTC${s.offset>=0?'+':''}${s.offset}, ${overlapText(s)}`);
