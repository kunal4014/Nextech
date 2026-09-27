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
const heroMotionFallback=document.getElementById('heroMotionFallback');
const heroStage=exp?.querySelector('.stage');

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
  if(heroMotionFallback) heroMotionFallback.style.transform='scale(1.035) translate3d(0,'+(amount*10)+'px,0)';
}

title.style.transition='opacity .22s ease';
textEl.style.transition='opacity .22s ease';
ey.style.transition='opacity .22s ease';

if(heroVideo){
  heroVideo.muted=true;
  heroVideo.defaultMuted=true;
  heroVideo.setAttribute('muted','');
  heroVideo.setAttribute('playsinline','');
  heroVideo.setAttribute('webkit-playsinline','');

  let fallbackEpoch=0;
  let fallbackActive=false;

  const syncFallbackStory=()=>{
    if(!fallbackActive)return;
    const duration=8.2;
    const t=((performance.now()-fallbackEpoch)/1000)%duration;
    const scene=videoScenes.find(s=>t>=s.start&&t<s.end)||videoScenes[videoScenes.length-1];
    setActiveVideoScene(scene);
    if(serviceProgressBar){
      serviceProgressBar.style.width=((t/duration)*100).toFixed(1)+'%';
    }
  };

  const useAnimatedImageFallback=()=>{
    if(fallbackActive)return;
    fallbackActive=true;
    fallbackEpoch=performance.now();
    heroStage?.classList.add('motion-fallback');
    syncFallbackStory();
  };

  const tryHeroPlay=()=>{
    const attempt=heroVideo.play();
    if(attempt&&typeof attempt.then==='function'){
      attempt.then(()=>{
        fallbackActive=false;
        heroStage?.classList.remove('motion-fallback');
        syncToVideo();
      }).catch(useAnimatedImageFallback);
    }
  };

  heroVideo.addEventListener('loadedmetadata',()=>{
    syncToVideo();
    tryHeroPlay();
  });
  heroVideo.addEventListener('canplay',tryHeroPlay,{once:true});
  heroVideo.addEventListener('timeupdate',syncToVideo);
  heroVideo.addEventListener('play',()=>{
    if(!fallbackActive) syncToVideo();
  });
  heroVideo.addEventListener('seeked',syncToVideo);

  setInterval(()=>{
    if(fallbackActive) syncFallbackStory();
    else if(!heroVideo.paused) syncToVideo();
  },180);

  tryHeroPlay();
}
addEventListener('scroll',parallax,{passive:true});
addEventListener('resize',parallax);
syncToVideo();
parallax();

/* Workshop process timeline */
const processTimeline=document.getElementById('processTimeline');
const processStages=[...document.querySelectorAll('.processStage')];

function updateProcessTimeline(){
  if(!processTimeline||!processStages.length)return;

  const r=processTimeline.getBoundingClientRect();
  const vh=window.innerHeight||document.documentElement.clientHeight;
  const start=vh*.84;
  const end=vh*.30;
  const raw=(start-r.top)/(start-end+Math.max(0,r.height*.12));
  const p=Math.max(0,Math.min(1,raw));

  processTimeline.style.setProperty('--process-progress',p.toFixed(3));

  const thresholds=[.06,.30,.54,.78];
  processStages.forEach((el,i)=>{
    el.classList.toggle('is-active',p>=thresholds[i]);
  });
}

addEventListener('scroll',updateProcessTimeline,{passive:true});
addEventListener('resize',updateProcessTimeline);
updateProcessTimeline();

/* Client-pitch polish */
const siteNav=document.getElementById('siteNav');

function updateNavState(){
  siteNav?.classList.toggle('is-scrolled',window.scrollY>36);
}
addEventListener('scroll',updateNavState,{passive:true});
updateNavState();

/* Subtle one-time reveal for lower-page content. */
const revealTargets=[
  ...document.querySelectorAll(
    '.sectionHead, .servicesIntro, .serviceChapter, .moreService, .whyProof, .whyReason, .reviewTrustBar, .review, .faqItem, .contact'
  )
];

if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  revealTargets.forEach(el=>el.classList.add('revealItem'));
  const revealObserver=new IntersectionObserver((entries,observer)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.08,rootMargin:'0px 0px -6% 0px'});
  revealTargets.forEach(el=>revealObserver.observe(el));
}else{
  revealTargets.forEach(el=>el.classList.add('revealed'));
}

/* =========================================
   EA34117 conversion enhancements
========================================= */

/* Hero service cards are real controls: selecting one jumps the hero video
   to the relevant workshop chapter without changing the established layout. */
serviceSteps.forEach((step,index)=>{
  step.setAttribute('role','button');
  step.setAttribute('tabindex','0');
  step.setAttribute('aria-label','Show '+(step.querySelector('strong')?.textContent||'service')+' scene');

  const activateStep=()=>{
    const scene=videoScenes[Math.min(index,videoScenes.length-1)];
    if(!scene)return;
    setActiveVideoScene(scene);
    if(heroVideo && Number.isFinite(heroVideo.duration)){
      heroVideo.currentTime=Math.max(0,scene.start+.08);
      const playAttempt=heroVideo.play();
      if(playAttempt?.catch) playAttempt.catch(()=>{});
    }
  };

  step.addEventListener('click',activateStep);
  step.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      activateStep();
    }
  });
});


/* Continuous customer review rail.
   Duplicate the seven real review cards once for a seamless loop.
   Touch/hover/focus pauses the motion so people can read comfortably. */
(() => {
  const marquee=document.getElementById('reviewMarquee');
  const track=document.getElementById('reviewTrack');
  if(!marquee||!track)return;

  const originals=[...track.children];
  originals.forEach(card=>{
    const clone=card.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    track.appendChild(clone);
  });

  const pause=()=>marquee.classList.add('is-paused');
  const resume=()=>marquee.classList.remove('is-paused');

  marquee.addEventListener('pointerdown',pause,{passive:true});
  marquee.addEventListener('pointerup',()=>setTimeout(resume,900),{passive:true});
  marquee.addEventListener('pointercancel',resume,{passive:true});
  marquee.addEventListener('touchstart',pause,{passive:true});
  marquee.addEventListener('touchend',()=>setTimeout(resume,1200),{passive:true});
})();


/* =========================================
   BUSINESS VALUE POLISH
========================================= */

/* Active section indicator in the main navigation.
   Home is the hero/top area; later sections activate only after their
   actual section boundary crosses below the fixed header. */
const trackedNavLinks=[...document.querySelectorAll('.navlinks a[href^="#"]')];
const navSections=[
  {hash:'#top',section:null},
  {hash:'#service-explorer',section:document.getElementById('service-explorer')},
  {hash:'#why',section:document.getElementById('why')},
  {hash:'#reviews',section:document.getElementById('reviews')},
  {hash:'#contact',section:document.getElementById('contact')}
].filter(item=>item.hash==='#top'||item.section);

let navTicking=false;

function setActiveNav(hash){
  trackedNavLinks.forEach(link=>{
    link.classList.toggle('active',link.getAttribute('href')===hash);
  });
}

function updateActiveNav(){
  navTicking=false;

  const activationLine=window.scrollY+(window.innerWidth<=700?122:136);
  let activeHash='#top';

  navSections.slice(1).forEach(item=>{
    if(item.section && item.section.offsetTop<=activationLine){
      activeHash=item.hash;
    }
  });

  /* At the bottom of the document, Contact should always win. */
  if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-8){
    activeHash='#contact';
  }

  setActiveNav(activeHash);
}

function requestActiveNavUpdate(){
  if(navTicking)return;
  navTicking=true;
  requestAnimationFrame(updateActiveNav);
}

trackedNavLinks.forEach(link=>{
  link.addEventListener('click',()=>{
    setActiveNav(link.getAttribute('href'));
  });
});

addEventListener('scroll',requestActiveNavUpdate,{passive:true});
addEventListener('resize',requestActiveNavUpdate,{passive:true});
addEventListener('load',updateActiveNav,{once:true});
updateActiveNav();

/* Lightweight analytics hooks.
   If GA/gtag is connected later these fire automatically; dataLayer also works with GTM. */
function nextechTrack(eventName,detail={}){
  const payload={event:eventName,...detail};
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push(payload);
  if(typeof window.gtag==='function'){
    window.gtag('event',eventName,detail);
  }
  window.dispatchEvent(new CustomEvent('nextech:conversion',{detail:payload}));
}

document.querySelectorAll('[data-track]').forEach(el=>{
  el.addEventListener('click',()=>nextechTrack(el.dataset.track,{label:(el.textContent||'').trim()}));
});

serviceSteps.forEach((step,i)=>{
  step.addEventListener('click',()=>nextechTrack('hero_service_preview',{
    service:(step.querySelector('strong')?.textContent||'').trim(),
    step:i+1
  }));
});

/* Record booking submit intent without storing customer details. */
const bookingFormForTracking=document.getElementById('bookingForm');
bookingFormForTracking?.addEventListener('submit',()=>{
  bookingFormForTracking.classList.add('formPrepared');
  const fd=new FormData(bookingFormForTracking);
  nextechTrack('booking_request_started',{
    service:(fd.get('Service')||'').toString(),
    preferred_date:(fd.get('Preferred date')||'').toString()
  });
},{capture:true});


/* =========================================
   PREMIUM SCROLL-DRIVEN SERVICE EXPLORER
========================================= */
(() => {
  const explorer=document.getElementById('serviceExplorer');
  const scrollStory=document.getElementById('serviceExplorerScroll');
  if(!explorer||!scrollStory)return;

  const tabs=[...explorer.querySelectorAll('.serviceExplorerTab')];
  const photos=[...explorer.querySelectorAll('.serviceExplorerPhoto')];
  const mode=document.getElementById('serviceExplorerMode');
  const kicker=document.getElementById('serviceExplorerKicker');
  const title=document.getElementById('serviceExplorerTitle');
  const copy=document.getElementById('serviceExplorerText');
  const cta=document.getElementById('serviceExplorerCta');
  const progress=[...explorer.querySelectorAll('.serviceExplorerProgress i')];
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');

  const scenes={
    servicing:{mode:'01 · Scheduled care',kicker:'Logbook servicing & maintenance',title:'Keep it serviced. Keep it reliable.',text:'Routine servicing, oil and filter changes, fluid checks and scheduled maintenance to keep your vehicle running reliably.',cta:'Book servicing →'},
    brakes:{mode:'02 · Safety systems',kicker:'Brakes & clutch',title:'Stopping power checked properly.',text:'Brake pads, rotors and stopping performance checked properly so your vehicle stays safe, predictable and responsive.',cta:'Book a brake check →'},
    diagnostics:{mode:'03 · Fault finding',kicker:'Advanced vehicle diagnostics',title:'Find the issue before replacing parts.',text:'Modern scanning and fault finding helps identify the real problem before unnecessary parts are replaced.',cta:'Book diagnostics →'},
    suspension:{mode:'04 · Ride & handling',kicker:'Steering & suspension',title:'Restore comfort, handling and control.',text:'Inspection and repair of steering and suspension components to improve ride quality, steering feel and road control.',cta:'Book suspension inspection →'},
    transmission:{mode:'05 · Driveline',kicker:'Transmission service & repair',title:'Smooth power delivery starts underneath.',text:'Transmission and driveline servicing, diagnosis and repair to keep power delivery smooth and dependable.',cta:'Book transmission service →'},
    tyres:{mode:'06 · Road contact',kicker:'Tyres & wheel care',title:'Everything starts where the car meets the road.',text:'Tyre replacement, wear checks and balancing help maintain grip, braking performance and a smoother drive.',cta:'Book tyre service →'}
  };

  const sceneKeys=Object.keys(scenes);
  let active='servicing';
  let ticking=false;

  function stickyTop(){
    return innerWidth<=700?108:innerWidth<=1179?118:130;
  }

  function renderScene(key,track=false){
    const scene=scenes[key];
    if(!scene)return;

    const changed=key!==active;
    active=key;
    explorer.dataset.mode=key;

    photos.forEach(photo=>{
      const selected=photo.dataset.explorerPhoto===key;
      if(selected)photo.loading='eager';
      photo.classList.toggle('active',selected);
    });
    mode.textContent=scene.mode;
    kicker.textContent=scene.kicker;
    title.textContent=scene.title;
    copy.textContent=scene.text;
    cta.textContent=scene.cta;

    tabs.forEach(tab=>{
      const selected=tab.dataset.explorerMode===key;
      tab.classList.toggle('active',selected);
      tab.setAttribute('aria-selected',String(selected));
    });

    if(changed&&!reducedMotion.matches){
      explorer.classList.remove('scene-enter');
      void explorer.offsetWidth;
      explorer.classList.add('scene-enter');
    }

    if(track&&typeof nextechTrack==='function'){
      nextechTrack('service_explorer_select',{service:key});
    }
  }

  function updateProgress(overall,index){
    const scaled=Math.max(0,Math.min(sceneKeys.length,overall*sceneKeys.length));
    const local=Math.max(0,Math.min(1,scaled-index));

    progress.forEach((bar,i)=>{
      const fill=i<index?1:i===index?local:0;
      bar.style.setProperty('--service-fill',fill.toFixed(3));
      bar.classList.toggle('active',i===index);
      bar.classList.toggle('complete',i<index);
    });

    explorer.style.setProperty('--service-depth',((local-.5)*-7).toFixed(2));
  }

  function updateFromScroll(){
    ticking=false;

    if(innerWidth<=700){
      updateProgress((sceneKeys.indexOf(active)+1)/sceneKeys.length,sceneKeys.indexOf(active));
      return;
    }

    if(reducedMotion.matches){
      updateProgress(0,sceneKeys.indexOf(active));
      return;
    }

    const rect=scrollStory.getBoundingClientRect();
    const top=stickyTop();
    const travel=Math.max(1,rect.height-innerHeight+top);
    const overall=Math.max(0,Math.min(1,(top-rect.top)/travel));
    const scaled=Math.min(sceneKeys.length-.0001,overall*sceneKeys.length);
    const index=Math.min(sceneKeys.length-1,Math.floor(scaled));

    renderScene(sceneKeys[index],false);
    updateProgress(overall,index);
  }

  function requestUpdate(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(updateFromScroll);
  }

  function scrollToScene(index){
    if(innerWidth<=700){
      renderScene(sceneKeys[index],true);
      updateProgress((index+1)/sceneKeys.length,index);
      const rail=explorer.querySelector('.serviceExplorerNav');
      const tab=tabs[index];
      if(rail&&tab){
        rail.scrollTo({left:tab.offsetLeft-rail.offsetLeft-(rail.clientWidth-tab.clientWidth)/2,behavior:reducedMotion.matches?'auto':'smooth'});
      }
      return;
    }
    if(reducedMotion.matches){
      renderScene(sceneKeys[index],true);
      updateProgress(index/sceneKeys.length,index);
      return;
    }

    const rect=scrollStory.getBoundingClientRect();
    const absoluteTop=scrollY+rect.top;
    const top=stickyTop();
    const travel=Math.max(1,scrollStory.offsetHeight-innerHeight+top);
    const target=(index+.20)/sceneKeys.length;
    const destination=absoluteTop-top+(travel*target);

    scrollTo({top:Math.max(0,destination),behavior:'smooth'});

    if(typeof nextechTrack==='function'){
      nextechTrack('service_explorer_select',{service:sceneKeys[index]});
    }
  }

  tabs.forEach((tab,index)=>tab.addEventListener('click',()=>scrollToScene(index)));

  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  reducedMotion.addEventListener?.('change',requestUpdate);

  renderScene(sceneKeys[0],false);
  updateProgress(0,0);
  updateFromScroll();
})();

/* =========================================
   CURRENT-SITE COOKIE NOTICE
========================================= */
(() => {
  const notice=document.getElementById('cookieNotice');
  const okay=document.getElementById('cookieOkay');
  if(!notice||!okay)return;

  try{
    if(sessionStorage.getItem('nextechCookieNoticeDismissed')==='1'){
      notice.hidden=true;
    }
  }catch(e){}

  okay.addEventListener('click',()=>{
    notice.hidden=true;
    try{sessionStorage.setItem('nextechCookieNoticeDismissed','1')}catch(e){}
  });
})();


/* Load the location map when the visitor approaches it. */
(() => {
  const map=document.getElementById('locationMap');
  if(!map||!map.dataset.src)return;

  function startMap(){
    map.src=map.dataset.src;
    map.removeAttribute('data-src');
  }

  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        startMap();
        observer.disconnect();
      }
    },{rootMargin:'300px 0px',threshold:0});
    observer.observe(map);
  }else{
    startMap();
  }
})();
