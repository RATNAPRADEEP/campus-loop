(function(){
const GAMES_KEY='campusloop_games_v1';
const starterGames=[{
 id:'game-campus-quiz',
 title:'Campus Quick Quiz',
 description:'A fast 5-question campus challenge. Play directly inside CampusLoop.',
 type:'quiz',difficulty:'Easy',status:'Active',
 config:{questions:[
  {q:'Which tab is used to share a resource?',options:['Wishlist','Contribute','Profile','Active Loans'],answer:1},
  {q:'Where are shared resource files stored?',options:['Google Drive','Browser cache','Only GitHub','Email'],answer:0},
  {q:'What can you do from Marketplace?',options:['Find campus resources','Change your password only','Install Windows','Edit GitHub'],answer:0},
  {q:'Which section tracks borrowed items?',options:['Profile','Active Loans','Community','Wishlist'],answer:1},
  {q:'What is CampusLoop designed around?',options:['Campus sharing','Food delivery','Video streaming','Online banking'],answer:0}
 ]}
},{
 id:'game-campus-moulds',
 title:'Campus Mould Studio',
 description:'Pick a full-figure mould and colour each part by clicking it. Build your own campus character.',
 type:'mould',difficulty:'Easy',status:'Active',
 config:{moulds:['Robot','Campus Hero','Alien']}
}];

const gameEsc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
function gameStyles(){
 if($('campusGamesStyles'))return;
 const s=document.createElement('style');s.id='campusGamesStyles';s.textContent=`
#games .page-head{margin-bottom:18px}
.games-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:18px}
.games-toolbar .pill{margin-left:auto}
.games-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.game-card{border:1px solid var(--line);border-radius:12px;background:#fff;padding:20px;box-shadow:0 3px 16px rgba(16,24,40,.035);display:flex;flex-direction:column;min-height:210px}
.game-card h3{margin:8px 0 7px;font-size:19px}
.game-card p{color:var(--muted);font-size:13px;line-height:1.55;flex:1}
.game-card .game-meta{font-size:11px;color:var(--muted);margin-bottom:12px}
.game-card .game-play{width:100%}
.game-player{margin-top:18px;border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden;box-shadow:0 8px 28px rgba(16,24,40,.06)}
.game-player-head{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:18px 20px;border-bottom:1px solid var(--line)}
.game-player-body{padding:22px}
.quiz-progress{font-size:12px;color:var(--muted);margin-bottom:8px}
.quiz-question{font-size:22px;font-weight:800;line-height:1.25;margin-bottom:18px}
.quiz-options{display:grid;gap:10px}
.quiz-option{width:100%;text-align:left;border:1px solid var(--line);background:#fff;border-radius:9px;padding:13px 15px;cursor:pointer;font:inherit}
.quiz-option:hover{border-color:rgba(99,91,255,.35);background:var(--bg)}
.quiz-option.correct{border-color:#16a34a;background:#f0fdf4}
.quiz-option.wrong{border-color:#dc2626;background:#fef2f2}
.mould-picker{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.mould-picker .btn.active{border-color:rgba(99,91,255,.45);background:var(--bg)}
.mould-layout{display:grid;grid-template-columns:minmax(250px,360px) 1fr;gap:22px;align-items:start}
.mould-stage{border:1px solid var(--line);border-radius:14px;background:linear-gradient(180deg,#fafbff,#fff);padding:16px;min-height:410px;display:flex;align-items:center;justify-content:center}
.mould-stage svg{width:100%;max-width:300px;height:auto}
.mould-part{stroke:#30343b;stroke-width:2;cursor:pointer;transition:fill .18s,filter .18s,transform .18s;transform-box:fill-box;transform-origin:center}
.mould-part:hover{filter:brightness(.96);transform:scale(1.025)}
.mould-info{border:1px solid var(--line);border-radius:12px;padding:16px}
.mould-swatches{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 18px}
.mould-swatch{width:34px;height:34px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px var(--line);cursor:pointer}
.mould-swatch.active{box-shadow:0 0 0 2px #111}
.mould-complete{margin-top:14px;font-size:12px;color:var(--muted)}
.multiplayer-lobby{max-width:620px;margin:0 auto;text-align:center}.multiplayer-lobby h3{margin:0 0 8px}.multiplayer-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}.multiplayer-room{margin-top:18px;padding:16px;border:1px dashed var(--line);border-radius:12px;background:var(--bg)}.multiplayer-room-code{font-size:28px;font-weight:800;letter-spacing:3px;margin:8px 0 4px}.multiplayer-note{font-size:12px;color:var(--muted)}@media(max-width:650px){.multiplayer-actions{grid-template-columns:1fr}}
@media(max-width:700px){.mould-layout{grid-template-columns:1fr}.mould-stage{min-height:350px}}\n.game-result{text-align:center;padding:24px 10px}
.game-result strong{display:block;font-size:42px;letter-spacing:-1px;margin:8px 0}
.games-empty{padding:24px;text-align:center}
@media(max-width:900px){.games-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.games-grid{grid-template-columns:1fr}.game-player-head{align-items:flex-start;flex-direction:column}.games-toolbar .pill{margin-left:0}}
`;document.head.appendChild(s);
}
async function loadGamesFromDrive(){
 try{
  const rows=await cloudRead('Games');
  const parsed=rows.map((r,i)=>{
   let config={};try{config=JSON.parse(r['Config JSON']||r.Config||'{}')}catch{}
   return {id:r['Game ID']||r.id||'drive-game-'+i,title:r.Title||r.title||'Campus Game',description:r.Description||r.description||'',type:(r.Type||r.type||'quiz').toLowerCase(),difficulty:r.Difficulty||r.difficulty||'Normal',coverUrl:r['Cover URL']||r.coverUrl||'',status:String(r.Status||'Active'),config};
  }).filter(g=>g.status.toLowerCase()!=='inactive');
  return parsed.length?parsed:starterGames;
 }catch(e){console.warn('CampusLoop Games Drive catalog unavailable',e);return starterGames;}
}
function renderGames(games){
 const grid=$('gamesGrid');if(!grid)return;
 grid.innerHTML=games.length?games.map(g=>'<article class="game-card">'+(g.coverUrl?'<img src="'+gameEsc(g.coverUrl)+'" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:9px;margin-bottom:4px">':'<div style="font-size:28px">🎮</div>')+'<h3>'+gameEsc(g.title)+'</h3><div class="game-meta">'+gameEsc(g.type)+' · '+gameEsc(g.difficulty||'Normal')+'</div><p>'+gameEsc(g.description||'Play this CampusLoop mini game directly in the app.')+'</p><button class="btn primary game-play" data-play-game="'+gameEsc(g.id)+'">Play now</button></article>').join(''):'<div class="card games-empty"><b>No games available yet.</b><p class="resource-meta">Add a game row to the Google Drive Games sheet to publish it here.</p></div>';
}
function playQuiz(game){
 const qs=Array.isArray(game.config?.questions)?game.config.questions:[];
 if(!qs.length){$('gamePlayer').innerHTML='<div class="game-player-body"><p class="resource-meta">This game has no playable questions yet.</p></div>';return}
 let index=0,score=0,locked=false;
 const draw=()=>{
  const q=qs[index];
  $('gamePlayer').innerHTML='<div class="game-player-head"><div><b>'+gameEsc(game.title)+'</b><div class="resource-meta">Playing inside CampusLoop · '+(index+1)+' of '+qs.length+'</div></div><button class="btn" id="closeGameBtn" type="button" aria-label="Close game">×</button></div><div class="game-player-body"><div class="quiz-progress">Question '+(index+1)+' / '+qs.length+'</div><div class="quiz-question">'+gameEsc(q.q)+'</div><div class="quiz-options">'+q.options.map((o,i)=>'<button class="quiz-option" data-answer="'+i+'" type="button">'+gameEsc(o)+'</button>').join('')+'</div></div>';
  $('closeGameBtn').onclick=()=>{stopBattleRoomPolling();$('gamePlayer').innerHTML=''};
  document.querySelectorAll('#gamePlayer [data-answer]').forEach(btn=>btn.onclick=()=>{if(locked)return;locked=true;const chosen=Number(btn.dataset.answer),correct=chosen===Number(q.answer);btn.classList.add(correct?'correct':'wrong');if(correct)score++;document.querySelectorAll('#gamePlayer [data-answer]').forEach(b=>b.disabled=true);setTimeout(()=>{locked=false;index++;if(index<qs.length)draw();else finish();},450);});
 };
 const finish=()=>{$('gamePlayer').innerHTML='<div class="game-result"><div style="font-size:34px">🏆</div><div>Game complete</div><strong>'+score+' / '+qs.length+'</strong><p class="resource-meta">'+(score===qs.length?'Perfect score!':score>=Math.ceil(qs.length*.6)?'Great job!':'Good attempt — try again and beat your score.')+'</p><div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap"><button class="btn primary" id="playAgainBtn" type="button">Play again</button><button class="btn" id="closeGameBtn" type="button" aria-label="Close game">×</button></div></div>';$('playAgainBtn').onclick=()=>{index=0;score=0;draw()};$('closeGameBtn').onclick=()=>{$('gamePlayer').innerHTML=''};saveGameScore(game,score,qs.length);};
 draw();
}
function playMould(game){
 const moulds=Array.isArray(game.config?.moulds)&&game.config.moulds.length?game.config.moulds:['Robot','Campus Hero','Alien'];
 const colors=['#e8edf2','#8ecae6','#90be6d','#f9c74f','#f9844a','#f28482','#b8a1ff','#222831'];
 const mouldShapes=[
  [
   {id:'head',label:'Head',shape:'rect',x:102,y:34,w:96,h:78,rx:20},{id:'body',label:'Body',shape:'path',d:'M102 132 L198 132 L214 258 Q150 282 86 258 Z'},{id:'leftArm',label:'Left arm',shape:'path',d:'M102 144 L70 158 L42 236 Q39 248 52 254 Q64 259 71 247 L120 188 Z'},{id:'rightArm',label:'Right arm',shape:'path',d:'M198 144 L230 158 L258 236 Q261 248 248 254 Q236 259 229 247 L180 188 Z'},{id:'leftLeg',label:'Left leg',shape:'rect',x:88,y:258,w:54,h:132,rx:14},{id:'rightLeg',label:'Right leg',shape:'rect',x:158,y:258,w:54,h:132,rx:14},{id:'earLeft',label:'Left ear',shape:'rect',x:76,y:58,w:26,h:34,rx:8},{id:'earRight',label:'Right ear',shape:'rect',x:198,y:58,w:26,h:34,rx:8}
  ],
  [
   {id:'head',label:'Head',shape:'circle',cx:150,cy:72,r:46},{id:'body',label:'Body',shape:'path',d:'M105 132 Q150 112 195 132 L210 260 Q150 282 90 260 Z'},{id:'leftArm',label:'Left arm',shape:'path',d:'M105 145 L72 160 L46 238 Q43 250 55 255 Q66 258 71 247 L120 190 Z'},{id:'rightArm',label:'Right arm',shape:'path',d:'M195 145 L228 160 L254 238 Q257 250 245 255 Q234 258 229 247 L180 190 Z'},{id:'leftLeg',label:'Left leg',shape:'path',d:'M94 252 L142 258 L137 382 Q135 394 121 394 L88 394 Q78 390 82 379 Z'},{id:'rightLeg',label:'Right leg',shape:'path',d:'M158 258 L206 252 L218 379 Q222 390 212 394 L179 394 Q165 394 163 382 Z'},{id:'earLeft',label:'Left ear',shape:'path',d:'M108 55 L76 35 L88 76 Z'},{id:'earRight',label:'Right ear',shape:'path',d:'M192 55 L224 35 L212 76 Z'}
  ],
  [
   {id:'head',label:'Head',shape:'path',d:'M105 88 Q104 38 150 28 Q196 38 195 88 Q190 126 150 132 Q110 126 105 88 Z'},{id:'body',label:'Body',shape:'path',d:'M112 132 Q150 116 188 132 L205 264 Q150 294 95 264 Z'},{id:'leftArm',label:'Left arm',shape:'path',d:'M112 144 Q82 148 64 180 L50 260 Q49 276 64 279 Q78 280 82 264 L100 208 L124 188 Z'},{id:'rightArm',label:'Right arm',shape:'path',d:'M188 144 Q218 148 236 180 L250 260 Q251 276 236 279 Q222 280 218 264 L200 208 L176 188 Z'},{id:'leftLeg',label:'Left leg',shape:'path',d:'M96 258 L146 270 L138 392 Q135 402 122 402 L92 402 Q80 398 84 386 Z'},{id:'rightLeg',label:'Right leg',shape:'path',d:'M154 270 L204 258 L216 386 Q220 398 208 402 L178 402 Q165 402 162 392 Z'},{id:'earLeft',label:'Left ear',shape:'path',d:'M108 60 L74 42 L88 92 Z'},{id:'earRight',label:'Right ear',shape:'path',d:'M192 60 L226 42 L212 92 Z'}
  ]
 ];
 let mouldIndex=0,selectedColor=colors[1];let parts=mouldShapes[0].map(p=>({...p}));let state={};const resetState=()=>{state={};parts.forEach(p=>state[p.id]=colors[0])};resetState();
 const shape=(p)=>p.shape==='circle'?'<circle class="mould-part" data-part="'+p.id+'" cx="'+p.cx+'" cy="'+p.cy+'" r="'+p.r+'" fill="'+state[p.id]+'"></circle>':p.shape==='rect'?'<rect class="mould-part" data-part="'+p.id+'" x="'+p.x+'" y="'+p.y+'" width="'+p.w+'" height="'+p.h+'" rx="'+p.rx+'" fill="'+state[p.id]+'"></rect>':'<path class="mould-part" data-part="'+p.id+'" d="'+p.d+'" fill="'+state[p.id]+'"></path>';
 const face=(index)=>{
  if(index===0)return '<circle cx="132" cy="67" r="5" fill="#30343b"></circle><circle cx="168" cy="67" r="5" fill="#30343b"></circle><rect x="128" y="82" width="44" height="8" rx="4" fill="#30343b"></rect>';
  if(index===1)return '<circle cx="134" cy="72" r="5" fill="#30343b"></circle><circle cx="166" cy="72" r="5" fill="#30343b"></circle><path d="M132 92 Q150 103 168 92" fill="none" stroke="#30343b" stroke-width="3" stroke-linecap="round"></path>';
  return '<path d="M116 43 L126 5 L143 40 Z" fill="#90be6d" stroke="#30343b" stroke-width="2"></path><path d="M184 43 L174 5 L157 40 Z" fill="#90be6d" stroke="#30343b" stroke-width="2"></path><circle cx="132" cy="72" r="7" fill="#30343b"></circle><circle cx="168" cy="72" r="7" fill="#30343b"></circle><path d="M130 98 Q150 108 170 98" fill="none" stroke="#30343b" stroke-width="4" stroke-linecap="round"></path><path d="M130 98 L135 113 L140 100 Z" fill="#fff" stroke="#30343b" stroke-width="1.5"></path><path d="M160 100 L165 113 L170 98 Z" fill="#fff" stroke="#30343b" stroke-width="1.5"></path>';
 };
 const draw=()=>{
  const svg='<svg viewBox="0 0 300 410" role="img" aria-label="'+gameEsc(moulds[mouldIndex])+' full figure mould">'+parts.map(shape).join('')+face(mouldIndex%3)+'</svg>';
  $('gamePlayer').innerHTML='<div class="game-player-head"><div><b>'+gameEsc(game.title)+'</b><div class="resource-meta">'+gameEsc(moulds[mouldIndex])+' · Click any part of the full mould to colour it.</div></div><button class="btn" id="closeGameBtn" type="button" aria-label="Close game">×</button></div><div class="game-player-body"><div class="mould-picker">'+moulds.map((m,i)=>'<button class="btn '+(i===mouldIndex?'active':'')+'" data-mould="'+i+'" type="button">'+gameEsc(m)+'</button>').join('')+'</div><div class="mould-layout"><div class="mould-stage">'+svg+'</div><div class="mould-info"><b>Choose a colour</b><div class="mould-swatches">'+colors.map((col,i)=>'<button class="mould-swatch '+(col===selectedColor?'active':'')+'" data-colour="'+col+'" style="background:'+col+'" aria-label="Colour '+(i+1)+'" type="button"></button>').join('')+'</div><b>Then click a mould part</b><p class="resource-meta">Every click changes only the selected part. The full figure stays intact.</p><div class="mould-complete">Robot = mechanical body · Campus Hero = human figure · Alien = creature figure.</div><button class="btn primary" id="openMultiplayerBtn" type="button" style="margin-top:16px;width:100%">⚔️ Multiplayer Battle</button></div></div></div>';
  $('closeGameBtn').onclick=()=>{$('gamePlayer').innerHTML=''};
  $('openMultiplayerBtn').onclick=()=>showMultiplayerLobby(game,()=>draw());
  document.querySelectorAll('#gamePlayer [data-colour]').forEach(b=>b.onclick=()=>{selectedColor=b.dataset.colour;draw()});
  document.querySelectorAll('#gamePlayer [data-mould]').forEach(b=>b.onclick=()=>{mouldIndex=Number(b.dataset.mould);parts=mouldShapes[mouldIndex%mouldShapes.length].map(p=>({...p}));resetState();draw()});
  document.querySelectorAll('#gamePlayer [data-part]').forEach(b=>b.onclick=()=>{state[b.dataset.part]=selectedColor;b.setAttribute('fill',selectedColor);});
 };
 draw();
}
async function joinMultiplayerBattle(roomCode){
 const playerId=String(window.db?.profile?.id||window.db?.profile?.['Student ID']||'player-'+Date.now());
 const playerName=String(window.db?.profile?.name||window.db?.profile?.Name||'CampusLoop Player');
 const code=String(roomCode||'').trim().toUpperCase();
 if(!code)throw new Error('Enter a Battle Room Code.');
 const rows=await cloudRead('BattleRooms');
 const index=rows.findIndex(r=>String(r.RoomCode||'').trim().toUpperCase()===code);
 if(index<0)throw new Error('Battle room not found. Check the room code.');
 const room=rows[index];
 if(String(room.Status||'').toUpperCase()!=='WAITING')throw new Error('This battle room is not waiting for another player.');
 if(String(room.Player1Id||'')===playerId)throw new Error('You cannot join your own battle room.');
 const now=new Date().toISOString();
 await cloudUpdate('BattleRooms',index+2,{'Player2Id':playerId,'Player2Name':playerName,'Status':'READY','UpdatedAt':now});
 return {roomCode:code,playerId,playerName};
}
function stopBattleRoomPolling(){if(window.__campusBattlePoll){clearInterval(window.__campusBattlePoll);window.__campusBattlePoll=null;}}
async function pollBattleRoom(roomCode,playerId){
 stopBattleRoomPolling();
 const check=async()=>{
  try{
   const rows=await cloudRead('BattleRooms');
   const room=rows.find(r=>String(r.RoomCode||'').trim().toUpperCase()===String(roomCode).trim().toUpperCase());
   if(!room)return;
   const status=String(room.Status||'').toUpperCase();
   const opponentId=String(room.Player1Id||'')===String(playerId) ? String(room.Player2Id||'') : String(room.Player1Id||'');
   const opponentName=String(room.Player1Id||'')===String(playerId) ? String(room.Player2Name||'') : String(room.Player1Name||'');
   const box=$('multiplayerLobbyStatus');
   if(!box)return;
   if(status==='READY' && opponentId){
    box.innerHTML='<b>Opponent connected ✓</b><div class="multiplayer-room-code">'+gameEsc(String(roomCode).toUpperCase())+'</div><div class="multiplayer-note">Opponent: '+gameEsc(opponentName||'CampusLoop Player')+' · Both players are ready.</div>';
    stopBattleRoomPolling();
   }else if(status==='WAITING'){
    box.innerHTML='<b>Waiting for opponent…</b><div class="multiplayer-room-code">'+gameEsc(String(roomCode).toUpperCase())+'</div><div class="multiplayer-note">Share this code with your opponent. This lobby checks Google Sheets automatically.</div>';
   }
  }catch(e){console.warn('Battle room polling failed',e);}
 };
 await check();
 window.__campusBattlePoll=setInterval(check,3000);
}
async function createMultiplayerBattle(game){
 const playerId=String(window.db?.profile?.id||window.db?.profile?.['Student ID']||'player-'+Date.now());
 const playerName=String(window.db?.profile?.name||window.db?.profile?.Name||'CampusLoop Player');
 const roomCode='CL-'+Math.random().toString(36).slice(2,7).toUpperCase();
 const now=new Date().toISOString();
 await cloudAdd('BattleRooms',{'RoomCode':roomCode,'Player1Id':playerId,'Player1Name':playerName,'Player2Id':'','Player2Name':'','Status':'WAITING','CreatedAt':now,'UpdatedAt':now});
 return {roomCode,playerId,playerName};
}
function showMultiplayerLobby(game,backToMould){
 $('gamePlayer').innerHTML='<div class="game-player-head"><div><b>'+gameEsc(game.title)+'</b><div class="resource-meta">Multiplayer Battle · Lobby</div></div><button class="btn" id="closeGameBtn" type="button" aria-label="Close game">×</button></div><div class="game-player-body"><div class="multiplayer-lobby"><div style="font-size:42px">⚔️</div><h3>Campus Mould Battle</h3><p class="resource-meta">Play a hidden-choice battle with another CampusLoop player.</p><div class="multiplayer-actions"><button class="btn primary" id="createBattleBtn" type="button">Create Battle</button><button class="btn" id="joinBattleBtn" type="button">Join Battle</button></div><div id="multiplayerLobbyStatus" class="multiplayer-room"><b>Lobby ready</b><div class="multiplayer-note">Online matchmaking will be connected in the next step.</div></div><button class="btn" id="backToMouldBtn" type="button" style="margin-top:14px">← Back to colouring</button></div></div>';
 $('closeGameBtn').onclick=()=>{$('gamePlayer').innerHTML=''};
 $('backToMouldBtn').onclick=()=>{stopBattleRoomPolling();backToMould()};
 $('createBattleBtn').onclick=async()=>{const b=$('createBattleBtn');b.disabled=true;b.textContent='Creating…';try{const battle=await createMultiplayerBattle(game);$('multiplayerLobbyStatus').innerHTML='<b>Waiting for opponent…</b><div class="multiplayer-room-code">'+gameEsc(battle.roomCode)+'</div><div class="multiplayer-note">Share this code with your opponent. This lobby checks Google Sheets automatically.</div>';pollBattleRoom(battle.roomCode,battle.playerId);}catch(e){console.error('Battle room creation failed',e);$('multiplayerLobbyStatus').innerHTML='<b>Could not create battle</b><div class="multiplayer-note">'+gameEsc(e.message||'Google Sheets sync failed.')+'</div>';}finally{b.disabled=false;b.textContent='Create Battle';}};
 $('joinBattleBtn').onclick=async()=>{const code=prompt('Enter the Battle Room Code:');if(!code)return;const b=$('joinBattleBtn');b.disabled=true;b.textContent='Joining…';try{const battle=await joinMultiplayerBattle(code);$('multiplayerLobbyStatus').innerHTML='<b>Opponent connected ✓</b><div class="multiplayer-room-code">'+gameEsc(battle.roomCode)+'</div><div class="multiplayer-note">Both players are ready. Opponent connection confirmed.</div>';pollBattleRoom(battle.roomCode,battle.playerId);}catch(e){console.error('Battle join failed',e);$('multiplayerLobbyStatus').innerHTML='<b>Could not join battle</b><div class="multiplayer-note">'+gameEsc(e.message||'Google Sheets sync failed.')+'</div>';}finally{b.disabled=false;b.textContent='Join Battle';}};
}
async function saveGameScore(game,score,total){try{await cloudAdd('GamesScores',{'Score ID':uid(),'Game ID':game.id,'Game Title':game.title,'Player ID':db.profile.id,'Player Name':db.profile.name||'Student',Score:score,Total:total,'Played At':today()});}catch(e){console.warn('Game score could not sync to Google Drive',e)}}
async function initGames(){gameStyles();window.campusLoopGames=starterGames;renderGames(starterGames);loadGamesFromDrive().then(games=>{window.campusLoopGames=games;renderGames(games)}).catch(e=>console.warn('Games background sync failed',e));$('gamesRefreshBtn')?.addEventListener('click',async()=>{const b=$('gamesRefreshBtn');b.disabled=true;b.textContent='Syncing…';try{const fresh=await loadGamesFromDrive();window.campusLoopGames=fresh;renderGames(fresh);toast('Games catalog refreshed from Google Drive.')}finally{b.disabled=false;b.textContent='Sync Games'}});document.addEventListener('click',e=>{const b=e.target.closest('[data-play-game]');if(!b)return;const game=window.campusLoopGames?.find(g=>g.id===b.dataset.playGame);if(!game)return;nav('games');if(game.type==='quiz')playQuiz(game);else if(game.type==='mould')playMould(game);else toast('This game type is not enabled yet.',true)});}
window.initCampusGames=initGames;
})();
document.addEventListener('DOMContentLoaded',()=>{if(window.initCampusGames)window.initCampusGames()});
