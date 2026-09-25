<script>
const menuBtn=document.getElementById('menuBtn');
const mobileMenu=document.getElementById('mobileMenu');
menuBtn?.addEventListener('click',()=>mobileMenu.classList.toggle('open'));
mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));

const exp=document.getElementById('experience');
const heroVideo=document.getElementById('heroVideo');
const title=document.getElementById('storyTitle');
const textEl=document.getElementById('storyText');
const ey=document.getElementById('storyEy');
const serviceSteps=[...document.querySelectorAll('.serviceStep')];
const serviceProgressBar=document.getElementById('serviceProgressBar');

const videoScenes=[
  {
    start:0,end:2.7,step:0,
    ey:'Queenstown · Adelaide',
    title:'Real workshop.<span>Real mechanical work.</span>',
    text:'Your service starts with a proper vehicle check in the workshop — clear advice, real inspection and practical mechanical care.'
  },
  {
    start:2.7,end:5.25,step:1,
    ey:'Service 01 · Oil & engine',
    title:'Keep it serviced.<span>Keep it reliable.</span>',
    text:'Oil, filters and engine-bay servicing are handled as the core maintenance work that keeps everyday cars reliable.'
  },
  {
    start:5.25,end:8.2,step:2,
    ey:'Service 02 · Brakes & diagnostics',
    title:'Check the system.<span>Fix it properly.</span>',
    text:'Brake inspection and modern diagnostics help find the cause, confirm the repair and keep the vehicle safe.'
  }
];

let currentVideoScene=-1;

function setActiveVideoScene(scene){
  if(!scene) return;
  if(currentVideoScene!==scene.step){
    currentVideoScene=scene.step;
    serviceSteps.forEach((el,i)=>el.classList.toggle('active',i===scene.step));
    title.style.opacity='.18';
    textEl.style.opacity='.18';
    ey.style.opacity='.18';
    requestAnimationFrame(()=>{
      title.innerHTML=scene.title;
      textEl.textContent=scene.text;
      ey.textContent=scene.ey;
      title.style.opacity='1';
      textEl.style.opacity='1';
      ey.style.opacity='1';
    });
  }
}

function syncToVideo(){
  if(!heroVideo) return;
  const duration=heroVideo.duration||8.2;
  const t=heroVideo.currentTime||0;
  const scene=videoScenes.find(s=>t>=s.start&&t<s.end)||videoScenes[videoScenes.length-1];
  setActiveVideoScene(scene);
  if(serviceProgressBar){
    const loopProgress=Math.max(0,Math.min(1,t/duration));
    serviceProgressBar.style.width=(loopProgress*100).toFixed(1)+'%';
  }
}

function parallax(){
  if(!exp) return;
  const r=exp.getBoundingClientRect();
  const amount=Math.max(-1,Math.min(1,-r.top/window.innerHeight));
  if(heroVideo) heroVideo.style.transform='scale(1.035) translate3d(0,'+(amount*10)+'px,0)';
}

title.style.transition='opacity .22s ease';
textEl.style.transition='opacity .22s ease';
ey.style.transition='opacity .22s ease';

if(heroVideo){
  heroVideo.addEventListener('loadedmetadata',syncToVideo);
  heroVideo.addEventListener('timeupdate',syncToVideo);
  heroVideo.addEventListener('play',syncToVideo);
  heroVideo.addEventListener('seeked',syncToVideo);
  setInterval(()=>{if(!heroVideo.paused)syncToVideo()},180);
}
addEventListener('scroll',parallax,{passive:true});
addEventListener('resize',parallax);
syncToVideo();
parallax();


</script>
