// Accessibility additions for generated pages. Shared script.js is unchanged.
const menu = document.getElementById('drawer');
const menuButton = document.getElementById('navtoggle');
menuButton.setAttribute('aria-controls', 'drawer');
function syncMenu() {
  menu.inert = !menu.classList.contains('open');
  menu.setAttribute('aria-modal', String(!menu.inert));
}
syncMenu();
new MutationObserver(syncMenu).observe(menu, {attributes:true, attributeFilter:['class']});
document.addEventListener('keydown', event => {
  if (menu.inert) return;
  if (event.key === 'Escape') { menuButton.focus(); return; }
  if (event.key !== 'Tab') return;
  const items = [menuButton, ...menu.querySelectorAll('a')];
  const first = items[0], last = items.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
// Keep the original click handlers and hidden values; add keyboard controls.
document.querySelectorAll('.custom-select').forEach((select, i) => {
  const trigger = select.querySelector('.custom-select-trigger');
  const list = select.querySelector('.custom-select-options');
  const options = [...list.children];
  list.id = `select-options-${i}`;
  list.setAttribute('role','listbox');
  const label = select.parentElement.querySelector('label');
  label.id = `select-label-${i}`;
  list.setAttribute('aria-labelledby',label.id);
  trigger.id = `select-trigger-${i}`;
  label.setAttribute('for',trigger.id);
  trigger.setAttribute('role','combobox'); trigger.tabIndex=0;
  trigger.setAttribute('aria-labelledby',label.id);
  trigger.setAttribute('aria-haspopup','listbox');
  trigger.setAttribute('aria-controls',list.id);
  options.forEach(option => { option.setAttribute('role','option'); option.tabIndex=-1; });
  const sync = () => {
    const open=select.classList.contains('open');
    trigger.setAttribute('aria-expanded',String(open)); list.inert=!open;
    options.forEach(o=>o.setAttribute('aria-selected',String(o.classList.contains('selected'))));
  };
  sync(); new MutationObserver(sync).observe(select,{attributes:true,attributeFilter:['class']});
  trigger.addEventListener('keydown',event=>{
    if(['Enter',' ','ArrowDown','ArrowUp'].includes(event.key)) {
      event.preventDefault();
      if(!select.classList.contains('open')) trigger.click();
      sync();
      options[event.key==='ArrowUp'?options.length-1:0].focus();
    }
  });
  options.forEach(option=>option.addEventListener('click',()=>trigger.focus()));
  options.forEach((option,n)=> option.addEventListener('keydown',event=>{
    if(['ArrowDown','ArrowUp','Home','End','Enter',' ','Escape','Tab'].includes(event.key)) {
      if(event.key!=='Tab') event.preventDefault();
      if(['Enter',' '].includes(event.key)) { option.click(); trigger.focus(); }
      else if(['Escape','Tab'].includes(event.key)) { select.classList.remove('open'); trigger.focus(); }
      else options[event.key==='Home'?0:event.key==='End'?options.length-1:(n+(event.key==='ArrowDown'?1:-1)+options.length)%options.length].focus();
    }
  }));
});
const form = document.getElementById('cform');
if(form) new MutationObserver(()=>{
  if(form.querySelector('input')) return;
  if(form.dataset.complete) return;
  form.dataset.complete='true';
  form.innerHTML='<div role="status" tabindex="-1"><h2>Message sent successfully</h2><p>I will get back to you within 24 hours.</p></div>';
  form.firstElementChild.focus();
}).observe(form,{childList:true});
// Shared smooth scrolling is overridden only for new-page local anchors.
document.addEventListener('click', event => {
  const link=event.target.closest('a[href^="#"]');
  if(!link) return;
  const id=link.getAttribute('href').slice(1), target=document.getElementById(id);
  if(!target) return;
  event.preventDefault(); event.stopImmediatePropagation();
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  if(id==='main') { target.tabIndex=-1; target.focus({preventScroll:true}); }
},true);
// Close before the shared Escape handler, then restore focus to the opener.
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menu.classList.contains('open')) {
    event.preventDefault(); event.stopImmediatePropagation();
    menuButton.click(); menuButton.focus();
  }
},true);

// Reserve space for decorative icons created by the existing shared script.
document.querySelectorAll('.tech-ico img').forEach(img=>{img.width=24;img.height=24;});
