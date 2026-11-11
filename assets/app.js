(function(){'use strict';
const cfg=window.PA_CPNS_CONFIG||{};if(!cfg.mode||!document.getElementById('app'))return;
const app=document.getElementById('app');const mode=cfg.mode;const sections=mode==='skd'?['TWK','TIU','TKP']:[mode.toUpperCase()];const key='PA_CPNS_PREDIKSI_2000_V1_'+mode;const E=(id)=>document.getElementById(id);
let banks={},questions=[],answers={},marked={},idx=0,remaining=0,deadline=0,timer=null,started=false,completed=false,scoreInfo=null;
let rng=()=>Math.random();const shuffle=x=>{let a=x.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btns=(arr)=>arr.map(x=>`<button type="button" class="btn ${x.style||''}" id="${x.id}">${esc(x.text)}</button>`).join('');
const totalScore=q=>q.section==='TKP'?5:5;
const bankUrl=(s)=>new URL('../bank-soal/'+s.toLowerCase()+'_500.json',document.baseURI).href;
const bankmap=Object.fromEntries(sections.map(s=>[s,bankUrl(s)]));
async function load(){
 E('load-status').textContent='Memuat bank soal ...';try{
  const out=await Promise.all(sections.map(async s=>{let r=await fetch(bankmap[s]);if(!r.ok)throw Error('Gagal membaca '+s+' (HTTP '+r.status+').');let rows=await r.json();if(!Array.isArray(rows)||rows.length!==500)throw Error(s+' harus berisi tepat 500 soal.');return [s,rows]}));
  for(const [s,a] of out)banks[s]=a;
  E('load-status').textContent='Siap: '+sections.map(s=>s+' '+banks[s].length+' soal').join(' · ')+'.'; E('btn-start').disabled=false;
  maybeRestore();
 }catch(err){E('load-status').innerHTML='<span class="level">Bank soal gagal dimuat:</span> '+esc(err.message)+'<p>Jalankan melalui GitHub Pages atau server lokal. Membuka index.html langsung sebagai file biasanya tidak mengizinkan pembacaan JSON.</p>';}
}
function sample(arr,n){
  let byfam=new Map();for(const q of arr){const f=q.family||q.id;if(!byfam.has(f))byfam.set(f,[]);byfam.get(f).push(q)}
  const familyOrders=shuffle([...byfam.keys()]);let picked=[],used=new Set();
  for(const f of familyOrders){if(picked.length>=n)break;let q=shuffle(byfam.get(f))[0];picked.push(q);used.add(q.id)}
  if(picked.length<n){let extra=shuffle(arr.filter(q=>!used.has(q.id)));picked.push(...extra.slice(0,n-picked.length))}
  return shuffle(picked);
}
function selectQuestions(){
 if(mode==='skd'){return [...sample(banks.TWK,30),...sample(banks.TIU,35),...sample(banks.TKP,45)]}
 const n=Number(E('count-select').value||25);return sample(banks[sections[0]],n);
}
function configTime(){if(mode==='skd')return Number(E('time-select').value||100);return Number(E('time-select').value||45)}
function save(){if(!started||completed)return;try{localStorage.setItem(key,JSON.stringify({ids:questions.map(x=>x.id),answers,marked,idx,deadline,mode,version:1}))}catch(e){}}
function clearSaved(){try{localStorage.removeItem(key)}catch(e){}}
function maybeRestore(){try{let d=JSON.parse(localStorage.getItem(key)||'null');if(!d||d.mode!==mode||!Array.isArray(d.ids)||!d.ids.length)return;let lookup=new Map(Object.values(banks).flat().map(q=>[q.id,q]));let reconstructed=d.ids.map(id=>lookup.get(id));if(reconstructed.some(x=>!x))return;
  E('resume-wrap').hidden=false;E('resume-wrap').innerHTML='<p>Latihan sebelumnya ditemukan ('+d.ids.length+' soal). Anda dapat melanjutkan sesi tersebut.</p><button class="btn" id="btn-resume">Lanjutkan sesi tersimpan</button> <button class="btn" id="btn-reset">Hapus sesi lama</button>';
  E('btn-resume').onclick=()=>{questions=reconstructed;answers=d.answers||{};marked=d.marked||{};idx=Math.max(0,Math.min(d.idx||0,questions.length-1));deadline=d.deadline||Date.now();started=true;completed=false;show('exam');render();startTicker();};
  E('btn-reset').onclick=()=>{clearSaved();E('resume-wrap').hidden=true;};
 }catch(e){}
}
function start(){questions=selectQuestions();answers={};marked={};idx=0;deadline=Date.now()+configTime()*60*1000;started=true;completed=false;scoreInfo=null;show('exam');render();startTicker();save();}
function show(id){['setup','exam','results'].forEach(x=>E(x).hidden=x!==id);window.scrollTo({top:Math.min(E('app').offsetTop,80),behavior:'instant'});}
function startTicker(){if(timer)clearInterval(timer);tick();timer=setInterval(tick,1000)}
function tick(){if(!started||completed)return;remaining=Math.max(0,deadline-Date.now());let secs=Math.ceil(remaining/1000);let min=Math.floor(secs/60);let sec=secs%60;let node=E('timer');node.textContent=String(min).padStart(2,'0')+':'+String(sec).padStart(2,'0');node.classList.toggle('urgent',secs<=300);if(secs===0)finish(true);}
function render(){if(!questions.length)return;let q=questions[idx];let responded=questions.filter(x=>answers[x.id]!==undefined).length;
 E('head-current').textContent='Soal '+(idx+1)+' dari '+questions.length;E('progress').style.width=(100*responded/questions.length)+'%';E('answered-label').textContent=responded+' / '+questions.length+' dijawab';
 E('q-meta').textContent=q.section+' · '+q.topic+' · Kode '+q.id;
 E('question').textContent=q.question;
 let pict=E('question-image');if(q.image){pict.hidden=false;pict.src=new URL(q.image,document.baseURI).href;pict.alt='Diagram figural untuk soal '+q.id+'; amati urutan dan lima pilihan pada gambar.'}else{pict.hidden=true;pict.removeAttribute('src')}
 E('options').innerHTML=q.options.map((v,j)=>`<label class="option"><input type="radio" name="answer" value="${j}" ${answers[q.id]===j?'checked':''}><span class="letter">${'ABCDE'[j]}.</span><span>${esc(v)}</span></label>`).join('');
 E('options').querySelectorAll('input').forEach(el=>el.addEventListener('change',()=>{answers[q.id]=Number(el.value);save();render();}));
 E('btn-prev').disabled=idx===0;E('btn-next').disabled=idx===questions.length-1;E('btn-mark').textContent=marked[q.id]?'Hapus tanda':'Tandai soal';
 let grid=questions.map((x,i)=>`<button aria-label="Buka soal ${i+1}" title="${esc(x.section+' - '+x.topic)}" data-qidx="${i}" class="${i===idx?'current':''} ${answers[x.id]!==undefined?'answered':''} ${marked[x.id]?'marked':''}">${i+1}</button>`).join('');E('q-grid').innerHTML=grid;
 E('q-grid').querySelectorAll('button').forEach(el=>el.onclick=()=>{idx=Number(el.dataset.qidx);save();render()});
 E('section-pills').innerHTML=sections.map(s=>{let a=questions.filter(x=>x.section===s);return '<span class="pill">'+s+': '+a.filter(q=>answers[q.id]!==undefined).length+'/'+a.length+'</span>'}).join('');
}
function grade(){let res={TWK:{score:0,n:0,max:0},TIU:{score:0,n:0,max:0},TKP:{score:0,n:0,max:0},SKB:{score:0,n:0,max:0}},answered=0,perfect=0;
  for(const q of questions){const b=res[q.section];b.n++;b.max+=totalScore(q);const x=answers[q.id];if(x===undefined)continue;answered++;let point=q.section==='TKP'?(q.weights[x]||0):(x===q.answer?5:0);b.score+=point;if(point===5)perfect++;}
 let grand=sections.reduce((n,s)=>n+res[s].score,0);let totalMax=questions.length*5;let pass=(mode==='skd'&&res.TWK.score>=65&&res.TIU.score>=80&&res.TKP.score>=166);
 return {res,grand,totalMax,answered,perfect,pass};}
function finish(auto=false){if(!started||completed)return;if(!auto&&!window.confirm('Akhiri tes sekarang? Jawaban tidak bisa diubah setelah dinilai.'))return;completed=true;started=false;if(timer)clearInterval(timer);clearSaved();scoreInfo=grade();show('results');renderResults(auto);}
function renderResults(auto){const s=scoreInfo;
 E('results-info').textContent=auto?'Waktu ujian berakhir. Jawaban dikoreksi otomatis.':'Ujian telah selesai dan dikoreksi otomatis.';
 E('total-score').textContent=s.grand+' / '+s.totalMax;
 E('result-status').textContent=mode==='skd'?(s.pass?'Memenuhi nilai ambang batas simulasi 2024':'Belum memenuhi seluruh ambang batas simulasi 2024'):'Nilai latihan: '+Math.round(s.grand/s.totalMax*100)+'% dari nilai maksimum';
 E('score-cards').innerHTML=sections.map(k=>{let o=s.res[k];let target=mode==='skd'?({TWK:65,TIU:80,TKP:166}[k]):null;return '<div class="resultcard"><span>'+k+'</span><b>'+o.score+' / '+o.max+'</b><span>'+o.n+' soal'+(target?' · acuan minimum '+target:'')+'</span></div>'}).join('')+'<div class="resultcard"><span>Jawaban terisi</span><b>'+s.answered+' / '+questions.length+'</b><span>Soal yang sudah dijawab</span></div>';
 E('review').innerHTML=questions.map((q,i)=>{let a=answers[q.id];let pt=(a===undefined?0:q.section==='TKP'?q.weights[a]:(a===q.answer?5:0));let best=q.section==='TKP'?q.weights.indexOf(5):q.answer;return `<article class="review"><h3>${i+1}. [${esc(q.section)}] ${esc(q.question)}</h3><p class="small-note">${esc(q.topic)} · ${esc(q.id)} · Poin Anda: ${pt}/5</p><p>Jawaban Anda: <strong>${a===undefined?'Tidak dijawab':esc('ABCDE'[a]+'. '+q.options[a])}</strong></p><p class="ans">${q.section==='TKP'?'Respons dengan bobot tertinggi':'Kunci benar'}: ${esc('ABCDE'[best]+'. '+q.options[best])}</p>${q.section==='TKP'?'<p class="small-note">Bobot pilihan A–E: '+q.weights.join(', ')+'</p>':''}<p>${esc(q.explanation)}</p></article>`}).join('');
}
function csvEscape(x){let v=String(x===undefined?'':x);if(/^[=+@\-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
function downloadCSV(){if(!scoreInfo)return;let rows=[['Nomor','Kode','Bagian','Topik','Soal','Jawaban peserta','Bobot peserta','Jawaban tertinggi','Pembahasan']];for(let i=0;i<questions.length;i++){let q=questions[i],a=answers[q.id],best=q.section==='TKP'?q.weights.indexOf(5):q.answer;rows.push([i+1,q.id,q.section,q.topic,q.question,a===undefined?'':q.options[a],a===undefined?0:q.section==='TKP'?q.weights[a]:a===q.answer?5:0,q.options[best],q.explanation])}
 let text=rows.map(row=>row.map(csvEscape).join(',')).join('\r\n');let blob=new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'});let url=URL.createObjectURL(blob);let link=document.createElement('a');link.href=url;link.download='Hasil_Tes_'+mode.toUpperCase()+'_Pendamping_Akademik.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function setup(){
 E('page-mode').textContent=mode==='skd'?'SIMULASI SKD CPNS 2024 (ACUAN PENILAIAN)':('LATIHAN '+sections[0]+' CPNS');
 E('setup-title').textContent=mode==='skd'?'Simulasi CAT SKD – Paket Lengkap':'Latihan Bank Soal '+sections[0];
 E('intro-detail').textContent=mode==='skd'?'Setiap paket memuat 30 TWK, 35 TIU dan 45 TKP, diambil acak dari bank 1.500 soal. Maksimum 550 poin.':'Tersedia 500 soal orisinal berbasis variasi kasus dan kompetensi; tentukan jumlah soal per sesi.';
 if(mode==='skd'){E('count-container').hidden=true;E('time-select').innerHTML='<option value="100">100 menit – acuan reguler</option><option value="130">130 menit – opsi akomodasi sesuai ketentuan</option>';}
 else {E('count-select').innerHTML=[10,25,50,100,250,500].map(n=>`<option value="${n}" ${n===25?'selected':''}>${n} soal</option>`).join('');E('time-select').innerHTML='<option value="30">30 menit</option><option value="45" selected>45 menit</option><option value="60">60 menit</option><option value="120">120 menit</option><option value="180">180 menit</option><option value="360">360 menit</option>';}
 E('btn-start').onclick=start;
 E('btn-prev').onclick=()=>{if(idx>0){idx--;save();render()}};E('btn-next').onclick=()=>{if(idx<questions.length-1){idx++;save();render()}};E('btn-mark').onclick=()=>{marked[questions[idx].id]=!marked[questions[idx].id];save();render()};
 E('btn-finish').onclick=()=>finish(false);E('btn-again').onclick=()=>{completed=false;questions=[];answers={};marked={};idx=0;show('setup');E('resume-wrap').hidden=true};E('btn-export').onclick=downloadCSV;E('btn-print').onclick=()=>window.print();
 load();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
