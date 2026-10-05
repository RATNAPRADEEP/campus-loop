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
}];

const gameEsc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
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
.game-result{text-align:center;padding:24px 10px}
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
 }catch(e){
  console.warn('CampusLoop Games Drive catalog unavailable',e);
  return starterGames;
 }
}
function renderGames(games){
 const grid=$('gamesGrid');
 if(!grid)return;
 grid.innerHTML=games.length?games.map(g=>'<article class="game-card">'+(g.coverUrl?'<img src="'+gameEsc(g.coverUrl)+'" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:9px;margin-bottom:4px">':'<div style="font-size:28px">🎮</div>')+'<h3>'+gameEsc(g.title)+'</h3><div class="game-meta">'+gameEsc(g.type)+' · '+gameEsc(g.difficulty||'Normal')+'</div><p>'+gameEsc(g.description||'Play this CampusLoop mini game directly in the app.')+'</p><button class="btn primary game-play" data-play-game="'+gameEsc(g.id)+'">Play now</button></article>').join(''):'<div class="card games-empty"><b>No games available yet.</b><p class="resource-meta">Add a game row to the Google Drive Games sheet to publish it here.</p></div>';
}
function playQuiz(game){
 const qs=Array.isArray(game.config?.questions)?game.config.questions:[];
 if(!qs.length){$('gamePlayer').innerHTML='<div class="game-player-body"><p class="resource-meta">This game has no playable questions yet.</p></div>';return}
 let index=0,score=0,locked=false;
 const draw=()=>{
  const q=qs[index];
  $('gamePlayer').innerHTML='<div class="game-player-head"><div><b>'+gameEsc(game.title)+'</b><div class="resource-meta">Playing inside CampusLoop · '+(index+1)+' of '+qs.length+'</div></div><button class="btn" id="closeGameBtn" type="button">Close</button></div><div class="game-player-body"><div class="quiz-progress">Question '+(index+1)+' / '+qs.length+'</div><div class="quiz-question">'+gameEsc(q.q)+'</div><div class="quiz-options">'+q.options.map((o,i)=>'<button class="quiz-option" data-answer="'+i+'" type="button">'+gameEsc(o)+'</button>').join('')+'</div></div>';
  $('closeGameBtn').onclick=()=>{$('gamePlayer').innerHTML=''};
  document.querySelectorAll('#gamePlayer [data-answer]').forEach(btn=>btn.onclick=()=>{
   if(locked)return;locked=true;
   const chosen=Number(btn.dataset.answer),correct=chosen===Number(q.answer);
   btn.classList.add(correct?'correct':'wrong');
   if(correct)score++;
   document.querySelectorAll('#gamePlayer [data-answer]').forEach(b=>b.disabled=true);
   setTimeout(()=>{locked=false;index++;if(index<qs.length)draw();else finish();},450);
  });
 };
 const finish=()=>{
  $('gamePlayer').innerHTML='<div class="game-result"><div style="font-size:34px">🏆</div><div>Game complete</div><strong>'+score+' / '+qs.length+'</strong><p class="resource-meta">'+(score===qs.length?'Perfect score!':score>=Math.ceil(qs.length*.6)?'Great job!':'Good attempt — try again and beat your score.')+'</p><button class="btn primary" id="playAgainBtn" type="button">Play again</button></div>';
  $('playAgainBtn').onclick=()=>{index=0;score=0;draw()};
  saveGameScore(game,score,qs.length);
 };
 draw();
}
async function saveGameScore(game,score,total){
 try{
  await cloudAdd('GamesScores',{'Score ID':uid(),'Game ID':game.id,'Game Title':game.title,'Player ID':db.profile.id,'Player Name':db.profile.name||'Student',Score:score,Total:total,'Played At':today()});
 }catch(e){console.warn('Game score could not sync to Google Drive',e)}
}
async function initGames(){
 gameStyles();
 const games=await loadGamesFromDrive();
 window.campusLoopGames=games;
 renderGames(games);
 $('gamesRefreshBtn')?.addEventListener('click',async()=>{const b=$('gamesRefreshBtn');b.disabled=true;b.textContent='Syncing…';const fresh=await loadGamesFromDrive();window.campusLoopGames=fresh;renderGames(fresh);b.disabled=false;b.textContent='Sync Games';toast('Games catalog refreshed from Google Drive.');});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-play-game]');if(!b)return;const game=window.campusLoopGames?.find(g=>g.id===b.dataset.playGame);if(!game)return;nav('games');if(game.type==='quiz')playQuiz(game);else toast('This game type is not enabled yet.',true)});
}
window.initCampusGames=initGames;
})();
document.addEventListener('DOMContentLoaded',()=>{if(window.initCampusGames)window.initCampusGames()});
