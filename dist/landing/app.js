const yearEl=document.getElementById('year');if(yearEl)yearEl.textContent=String(new Date().getFullYear())

const toggle=document.querySelector('.nav__toggle')
const menu=document.getElementById('menu')
toggle?.addEventListener('click',()=>{
  const open=menu?.classList.toggle('open')
  toggle.setAttribute('aria-expanded',open?'true':'false')
})

const dropBtn=document.querySelector('.dropdown__btn')
const drop=document.getElementById('drop1')
function setDrop(open){
  dropBtn?.setAttribute('aria-expanded',open?'true':'false')
  drop?.setAttribute('aria-hidden',open?'false':'true')
}
dropBtn?.addEventListener('click',(e)=>{e.preventDefault();const open=dropBtn.getAttribute('aria-expanded')!=='true';setDrop(open)})
document.addEventListener('click',(e)=>{if(!drop||!dropBtn)return; if(!drop.contains(e.target) && e.target!==dropBtn)setDrop(false)})

const track=document.querySelector('.carousel__track')
const prev=document.querySelector('.carousel__control.prev')
const next=document.querySelector('.carousel__control.next')
function scrollByCard(dir){const el=[...track.children][0];const w=el?.getBoundingClientRect().width||300;track.scrollBy({left:dir*w,behavior:'smooth'})}
prev?.addEventListener('click',()=>scrollByCard(-1))
next?.addEventListener('click',()=>scrollByCard(1))

const themeBtn=document.querySelector('.theme')
themeBtn?.addEventListener('click',()=>{document.documentElement.classList.toggle('light')})