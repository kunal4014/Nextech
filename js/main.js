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

/* Concept form behaves like a real interaction without contacting Nextech. */
const demoBookingForm=document.getElementById('demoBookingForm');
const demoFormStatus=document.getElementById('demoFormStatus');





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

/* Give the desktop review grid gentle movement without turning it into a carousel.
   On phones the existing swipeable cards remain fully user-controlled. */
const reviewCards=[...document.querySelectorAll('.review')];
let reviewSpotlight=0;
function updateReviewSpotlight(){
  if(!reviewCards.length)return;
  reviewCards.forEach((card,i)=>card.classList.toggle('reviewSpotlight',i===reviewSpotlight));
}
updateReviewSpotlight();
if(reviewCards.length>1 && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  setInterval(()=>{
    if(document.hidden||innerWidth<701)return;
    reviewSpotlight=(reviewSpotlight+1)%reviewCards.length;
    updateReviewSpotlight();
  },4200);
}

/* Turn the concept booking form into a usable booking handoff.
   It validates locally and opens a pre-filled email draft to the workshop;
   nothing is sent without the visitor explicitly sending the email. */
demoBookingForm?.addEventListener('submit',e=>{
  e.preventDefault();
  if(!demoBookingForm.checkValidity()){
    demoBookingForm.reportValidity();
    return;
  }

  const formData=new FormData(demoBookingForm);
  const value=name=>(formData.get(name)||'').toString().trim();
  const subject='Nextech booking request — '+(value('Vehicle')||value('Name')||'website enquiry');
  const lines=[
    'Hi Nextech,',
    '',
    'I would like to request a service booking.',
    '',
    'Name: '+value('Name'),
    'Phone: '+value('Phone'),
    'Email: '+value('Email'),
    'Vehicle: '+value('Vehicle'),
    'Registration: '+value('Registration'),
    'Service: '+value('Service'),
    'Preferred date: '+value('Preferred date'),
    'Preferred time: '+value('Preferred time'),
    '',
    'What I need looked at:',
    value('Details')||'Not specified',
    '',
    'Please contact me to confirm availability.'
  ];

  if(demoFormStatus){
    demoFormStatus.textContent='Your booking details are ready. Opening a pre-filled email to Nextech — review it, then send when you are happy.';
    demoFormStatus.classList.add('show');
  }

  const mailto='mailto:nextechautorepairs@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
  setTimeout(()=>{ window.location.href=mailto; },180);
});


/* =========================================
   BUSINESS VALUE POLISH
========================================= */

/* Active section indicator in the main navigation */
const trackedNavLinks=[...document.querySelectorAll('.navlinks a[href^="#"]')];
const sectionTargets=trackedNavLinks
  .map(link=>({link,id:link.getAttribute('href').slice(1)}))
  .map(item=>({...item,section:document.getElementById(item.id)}))
  .filter(item=>item.section);

if('IntersectionObserver' in window){
  const navObserver=new IntersectionObserver(entries=>{
    const visible=entries
      .filter(e=>e.isIntersecting)
      .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    trackedNavLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+visible.target.id));
  },{rootMargin:'-34% 0px -54% 0px',threshold:[0,.1,.25,.5]});
  sectionTargets.forEach(item=>navObserver.observe(item.section));
}

/* Review controls + pause on hover */
const reviewWrap=document.querySelector('#reviews .reviews');
const reviewDots=[...document.querySelectorAll('.reviewDot')];
let reviewPaused=false;
reviewWrap?.addEventListener('mouseenter',()=>reviewPaused=true);
reviewWrap?.addEventListener('mouseleave',()=>reviewPaused=false);

reviewDots.forEach((dot,i)=>dot.addEventListener('click',()=>{
  reviewSpotlight=i;
  updateReviewSpotlight();
  reviewDots.forEach((d,idx)=>d.classList.toggle('active',idx===i));
  reviewCards[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
}));

if(reviewCards.length>1 && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  setInterval(()=>{
    if(reviewPaused||document.hidden||innerWidth<701)return;
    reviewSpotlight=(reviewSpotlight+1)%reviewCards.length;
    updateReviewSpotlight();
    reviewDots.forEach((d,idx)=>d.classList.toggle('active',idx===reviewSpotlight));
  },4600);
}

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

/* Extend booking email with contact preferences and record the intent locally. */
const bookingFormForTracking=document.getElementById('demoBookingForm');
bookingFormForTracking?.addEventListener('submit',()=>{
  bookingFormForTracking.classList.add('formPrepared');
  const fd=new FormData(bookingFormForTracking);
  nextechTrack('booking_request_prepared',{
    service:(fd.get('Service')||'').toString(),
    preferred_date:(fd.get('Preferred date')||'').toString()
  });
},{capture:true});


/* =========================================
   INTERACTIVE SERVICE EXPLORER
========================================= */
(() => {
  const explorer=document.getElementById('serviceExplorer');
  if(!explorer)return;

  const tabs=[...explorer.querySelectorAll('.serviceExplorerTab')];
  const image=document.getElementById('serviceExplorerImage');
  const mode=document.getElementById('serviceExplorerMode');
  const kicker=document.getElementById('serviceExplorerKicker');
  const title=document.getElementById('serviceExplorerTitle');
  const copy=document.getElementById('serviceExplorerText');
  const cta=document.getElementById('serviceExplorerCta');
  const progress=[...explorer.querySelectorAll('.serviceExplorerProgress i')];
  const hotspots=[...explorer.querySelectorAll('.explorerHotspot')];

  const scenes={
    servicing:{
      mode:'01 · Scheduled care',
      kicker:'Logbook servicing & maintenance',
      title:'Keep it serviced. Keep it reliable.',
      text:'Routine servicing, oil and filter changes, fluid checks and scheduled maintenance to keep your vehicle running reliably.',
      cta:'Book servicing →',
      image:'https://images.pexels.com/photos/10490621/pexels-photo-10490621.jpeg?auto=compress&cs=tinysrgb&w=1800',
      pos:'center 48%',
      hotspots:['Engine','Oil & filter','Service point']
    },
    brakes:{
      mode:'02 · Safety systems',
      kicker:'Brakes & clutch',
      title:'Stopping power checked properly.',
      text:'Brake pads, rotors and stopping performance checked properly so your vehicle stays safe, predictable and responsive.',
      cta:'Book a brake check →',
      image:'https://images.pexels.com/photos/6870299/pexels-photo-6870299.jpeg?auto=compress&cs=tinysrgb&w=1800',
      pos:'center 48%',
      hotspots:['Rotor','Caliper','Inspection']
    },
    diagnostics:{
      mode:'03 · Fault finding',
      kicker:'Advanced vehicle diagnostics',
      title:'Find the issue before replacing parts.',
      text:'Modern scanning and fault finding helps identify the real problem before unnecessary parts are replaced.',
      cta:'Book diagnostics →',
      image:'https://nextechautorepairs.com.au/wp-content/uploads/2020/04/service-tab.png',
      pos:'58% 52%',
      hotspots:['Engine','Systems scan','Fault data']
    },
    suspension:{
      mode:'04 · Ride & handling',
      kicker:'Steering & suspension',
      title:'Restore comfort, handling and control.',
      text:'Inspection and repair of steering and suspension components to improve ride quality, steering feel and road control.',
      cta:'Book suspension inspection →',
      image:'https://images.pexels.com/photos/34277924/pexels-photo-34277924.jpeg?auto=compress&cs=tinysrgb&w=1800',
      pos:'center 47%',
      hotspots:['Strut','Hub','Mount']
    },
    transmission:{
      mode:'05 · Driveline',
      kicker:'Transmission service & repair',
      title:'Smooth power delivery starts underneath.',
      text:'Transmission and driveline servicing, diagnosis and repair to keep power delivery smooth and dependable.',
      cta:'Book transmission service →',
      image:'https://nextechautorepairs.com.au/wp-content/uploads/2023/07/1_0x0_790x520_0x520_bad-driving-habits-gearstick-1.jpg',
      pos:'center',
      hotspots:['Driveline','Transmission','Inspection']
    },
    tyres:{
      mode:'06 · Road contact',
      kicker:'Tyres & wheel care',
      title:'Everything starts where the car meets the road.',
      text:'Tyre replacement, wear checks and balancing help maintain grip, braking performance and a smoother drive.',
      cta:'Book tyre service →',
      image:'https://nextechautorepairs.com.au/wp-content/uploads/2020/03/pexels-anna-shvets-4315574.jpg',
      pos:'center 48%',
      hotspots:['Tyre','Wear','Balance']
    }
  };

  let active='servicing';

  function setScene(key,track=true){
    const scene=scenes[key];
    if(!scene||key===active&&track)return;

    explorer.classList.add('is-switching');

    setTimeout(()=>{
      active=key;
      explorer.dataset.mode=key;
      image.style.backgroundImage='url("'+scene.image+'")';
      image.style.backgroundPosition=scene.pos;
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

      progress.forEach((bar,i)=>bar.classList.toggle('active',i===Object.keys(scenes).indexOf(key)));
      hotspots.forEach((spot,i)=>{
        const label=spot.querySelector('b');
        if(label)label.textContent=scene.hotspots[i]||'';
      });

      explorer.classList.remove('is-switching');

      if(track && typeof nextechTrack==='function'){
        nextechTrack('service_explorer_select',{service:key});
      }
    },180);
  }

  tabs.forEach(tab=>tab.addEventListener('click',()=>setScene(tab.dataset.explorerMode)));

  progress[0]?.classList.add('active');
})();
