'use strict';
const DB=window.ORIGAMI_DATABASE;
const FAMILY={
 Miura:{jp:'三浦折り',en:'Miura-ori',shape:'総説記録では剛体折り「可」が一致。理想化した幾何と、材料・板厚を含む実機の性能は区別が必要です。'},
 Waterbomb:{jp:'ウォーターボム',en:'Waterbomb',shape:'平坦折り可能性には記録間の違いがあります。対称条件や折り線構成による違いを確認する必要があります。'},
 Flasher:{jp:'フラッシャー',en:'Flasher',shape:'巻き込みから広がる形の模式図。面積拡大の根拠があっても、それだけで放熱性能は判断できません。'},
 Kresling:{jp:'クレスリング',en:'Kresling',shape:'総説記録では剛体折り「不可」が一致。軸方向の変化やねじれを連想する模式図で、面のひずみは解析していません。'},
 Yoshimura:{jp:'吉村パターン',en:'Yoshimura',shape:'剛体折り可能性には記録間の違いがあります。対象形状と前提条件を原著や幾何解析で確認する必要があります。'},
 Accordion:{jp:'アコーディオン',en:'Accordion',shape:'蛇腹の形の模式図。このDBでC1がNRなのは対応する記録がないためで、「たためない」という判定ではありません。'}
};
const CRITERIA={
 C1:{name:'展開・収納性',short:'たためる？',group:'幾何・運動学',tasks:['折り線構成・形状・折り状態を特定する','理想化した剛体折りと試験体の変形を区別する','原著と幾何解析で前提条件を確認する']},
 C2:{name:'展開制御性',short:'制御できる？',group:'幾何と実装',tasks:['自由度と拘束・対称条件を確認する','対象の折り経路と分岐条件を記録する','実際の駆動機構と制御方法を確認する']},
 C3:{name:'構造安定性',short:'安定する？',group:'実装への依存大',tasks:['材料・板厚・支持条件・荷重条件を揃える','剛性・強度・座屈など、評価指標を決める','同じ指標と試験条件の原著データを確認する']},
 C4:{name:'放熱性能',short:'冷える？',group:'実装への依存大',tasks:['熱流束・温度・熱抵抗など評価指標と比較基準を決める','材料・加熱・流れ条件・折り状態を揃える','支持板や接合部を含む構成とモデルの検証範囲を確認する']},
 C5:{name:'製造容易性',short:'作れる？',group:'幾何と実装',tasks:['材料・厚さ・加工方法・寸法を記録する','折り目・ヒンジ・組立工程の条件を確認する','同じ要求で製造可能か試作して確認する']},
 C6:{name:'駆動・再構成性',short:'動かせる？',group:'幾何と実装',tasks:['必要な駆動源と入力条件を確認する','展開だけでなく収納・再設定の手順も確認する','熱による駆動と放熱性能を区別する']},
 C7:{name:'耐久・信頼性',short:'繰り返せる？',group:'実装への依存大',tasks:['繰返し回数・荷重・温度条件を確認する','短期の繰返し動作と長期寿命を区別する','破損・ヒステリシス・再現性の測定方法を決める']},
 C8:{name:'軽量性',short:'軽い？',group:'実装への依存大',tasks:['同じ試験体・システムの質量を記録する','有効展開面積の定義と測定値を確認する','単位・付属部品の範囲を揃えて面積密度を計算する']}
};
const LIT=Object.fromEntries(DB.literature.map(l=>[l.id,l]));
const RECORD=Object.fromEntries(DB.records.map(r=>[r.id,r]));
const THERM=Object.fromEntries(DB.thermal.map(t=>[t.id,t]));
const THERMAL_TITLES={
 'EV-0528':'冷却熱流束の増加（加熱800 W）','EV-0529':'冷却熱流束の増加（加熱1600 W）','EV-0530':'冷却熱流束の増加（加熱2400 W）',
 'EV-0531':'冷却速度の倍率（加熱800 W）','EV-0532':'冷却速度の倍率（加熱1600 W）','EV-0533':'冷却速度の倍率（加熱2400 W）',
 'EV-0534':'圧縮による総括熱伝達率の低下','EV-0535':'圧縮による総括熱伝達率の低下',
 'EV-0536':'最適幅からさらに圧縮した時の冷却速度低下','EV-0537':'最適幅からさらに圧縮した時の冷却速度低下','EV-0538':'最適幅からさらに圧縮した時の冷却速度低下',
 'EV-0539':'幾何モデルの面積拡大倍率','EV-0540':'自然対流の放熱倍率（CFD）','EV-0541':'流路に沿う強制対流の放熱倍率（CFD）','EV-0542':'圧力損失の倍率（CFD）','EV-0543':'流路と直交する放熱倍率（CFD）','EV-0544':'放射による放熱倍率（解析モデル）',
 'EV-0545':'風洞での物理的な熱試験','EV-0546':'展開状態のモデルと実験の差','EV-0547':'風洞試験の風速（試験条件）','EV-0548':'ヒーター入力（試験条件）',
 'EV-0549':'支持板のみの温度低下率（モデル）','EV-0550':'展開状態の温度低下率（モデル）','EV-0551':'収縮状態の温度低下率（モデル）','EV-0552':'従来フィンに対する冷却改善（モデル）','EV-0553':'フィンありの定常状態までの時間（モデル）','EV-0554':'フィンなしの定常状態までの時間（モデル）','EV-0555':'フィンによる定常到達時間の短縮（モデル）','EV-0556':'展開時のリンク機構の追加寄与（モデル解釈）','EV-0557':'収縮時のリンク機構の追加寄与（モデル解釈）','EV-0558':'収縮・展開のリンク機構の寄与比（モデル解釈）'
};
function metricTitle(r){
 if(THERMAL_TITLES[r.id])return THERMAL_TITLES[r.id];
 const m=String(r.metric||'');
 if(/rigid foldability/i.test(m))return '剛体折り可能性';
 if(/flat foldability/i.test(m))return '平坦折り可能性';
 if(/developability/i.test(m))return '展開可能性の記述';
 if(/\bDOF\b|1-DOF/i.test(m))return '自由度・動作の拘束';
 if(/\bmass\b/i.test(m))return '試験体の質量';
 if(/cycles|cycle count/i.test(m))return '繰返し回数';
 if(/force|stiffness|strength|buckling/i.test(m))return CRITERIA[r.criterion]?CRITERIA[r.criterion].name+'に関する記録':'構造応答の記録';
 return /[\u3040-\u30ff\u3400-\u9fff]/.test(m)?m:(CRITERIA[r.criterion]?CRITERIA[r.criterion].name+'に関する記録':'参考記録');
}
function formatValue(r){return (r.value===null||r.value===undefined||r.value==='')?'未記載':String(r.value);}
function familyLabel(f){return FAMILY[f]?FAMILY[f].jp:f;}
function safeURL(s){
 const text=String(s||''),http=text.match(/https?:\/\/[^\s]+/i),doi=text.match(/10\.\d{4,9}\/[^\s]+/i);
 if(http)return http[0];if(doi)return 'https://doi.org/'+doi[0];return null;
}
function filteredRecords(filters){
 const tokens=String(filters.q||'').normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
 return DB.records.filter(r=>{
  if(filters.scope==='main'&&!DB.families.includes(r.family))return false;
  if(filters.scope==='mapped'&&(!DB.families.includes(r.family)||!CRITERIA[r.criterion]))return false;
  if(filters.family==='other'&&DB.families.includes(r.family))return false;
  if(filters.family&&filters.family!=='all'&&filters.family!=='other'&&r.family!==filters.family)return false;
  if(filters.criterion&&filters.criterion!=='all'&&r.criterion!==filters.criterion)return false;
  if(filters.level&&filters.level!=='all'&&r.level!==filters.level)return false;
  if(filters.origin==='review'&&r.validation!=='レビュー')return false;
  if(filters.origin==='other'&&r.validation==='レビュー')return false;
  const l=LIT[r.literature];const hay=[...Object.values(r).map(v=>v??''),familyLabel(r.family),CRITERIA[r.criterion]?.name,metricTitle(r),l?.authors,l?.title,l?.year].join(' ').normalize('NFKC').toLowerCase();
  return tokens.every(t=>hay.includes(t));
 });
}
function recordsFor(f,k){return DB.records.filter(r=>r.family===f&&r.criterion===k);}
function aggregateComparability(f,key){
 if(!DB.matrix[f][key].count)return {state:'nr',label:'根拠・変数が不足'};
 if(['C1','C3','C4','C8'].includes(key))return {state:'paper',label:'条件差を分離できない（提出原稿 図3の＊）'};
 return {state:'unconfirmed',label:'候補間の比較条件は未確認（＊とは別の状態）'};
}
function compareEvidence(a,b,key,ra,rb){
 if(!ra||!rb)return {title:'根拠・変数が不足しているため、優劣を判断できません。',text:key==='C8'?'6候補とも、同じ試験体の質量と有効展開面積が揃っていません。質量だけで軽量性を順位付けしません。':'少なくとも一方は、このDBで対応する根拠がありません。根拠の有無と性能の優劣を分け、必要な条件・変数を収集します。',checks:['不足する情報を確認','NR ≠ 低性能']};
 if(ra.id===rb.id)return {title:'同じ記録が選ばれています。',text:'比較する根拠を別の記録に変更してください。同じ根拠を並べても、新たな比較結果にはなりません。',checks:['同一 Evidence ID']};
 if(key==='C4'&&a!==b)return {title:'直接比較できません。指標・比較基準・条件が異なります。',text:'この2候補の熱記録は、評価指標や試験・モデル条件が共通とは確認されていません。たとえばMiuraの冷却熱流束とKreslingのモデル温度低下率は別の指標です。物理試験の実施という記述も、数値の性能値とは比較できません。％やE区分の大小から勝者を決めません。',checks:['評価指標','比較基準','材料・加熱・流れ条件']};
 if(ra.literature!==rb.literature)return {title:'別文献の結果です。共通の比較条件は確認できていません。',text:'同じ単位やE区分でも、試験体・評価方法・比較基準が異なる可能性があります。このDBの「比較可」ラベルは、この2記録の直接比較を承認するものではありません。',checks:['対象形状・寸法','材料・厚さ','評価方法・境界条件']};
 return {title:'同じ文献の条件比較です。条件差を残して読みます。',text:'同一文献でも、異なる指標・試験体・折り状態の数値をまとめて順位付けできません。原著の比較対象と条件を確認してください。この表示は文献内の違いを調べるためのものです。',checks:['同一文献','評価指標と基準を確認','別候補への一般化は未確認']};
}
function density(m,a,same){
 if(m===null||a===null||String(m).trim()===''||String(a).trim()==='')return {ok:false,text:'質量と有効展開面積の両方を入力してください。'};
 const mass=Number(m),area=Number(a);
 if(!Number.isFinite(mass)||!Number.isFinite(area)||mass<=0||area<=0)return {ok:false,text:'0より大きい有限の数値を入力してください。'};
 if(!same)return {ok:false,text:'同じ試験体の値と面積の定義を確認してください。確認前は計算しません。'};
 const value=(mass/1000)/(area/10000);
 if(!Number.isFinite(value)||value<=0)return {ok:false,text:'値が計算できる範囲を超えています。入力の単位と大きさを確認してください。'};
 return {ok:true,value,text:'入力値による学習用の計算です。文献DBやC8のNRは更新しません。'};
}
function csvCell(v){let text=v==null?'':String(v);if(typeof v==='string'&&/^[=+@]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
function csvFor(records){const keys=['id','family','criterion','literature','pattern','metric','value','unit','level','validation','material','thickness','dimensions','conditions','method','page','figure','comparability','limitation','note','row','indexRow'];return '\ufeff'+[keys.map(csvCell).join(','),...records.map(r=>keys.map(k=>csvCell(r[k])).join(','))].join('\r\n');}
// BROWSER INTERFACE
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tag=(level,star=false)=>'<span class="tag '+esc(level)+'">'+esc(level)+(star&&level!=='NR'?'＊':'')+'</span>';
function aggregateTag(f,key){const a=aggregateComparability(f,key);return '<span class="aggregate-status">'+tag(DB.matrix[f][key].level,a.state==='paper')+(a.state==='unconfirmed'?'<span class="small" style="font-size:9px">比較未確認</span>':'')+'</span>';}
const textOrMissing=v=>(v===null||v===undefined||v==='')?'未記載':String(v);
const state={view:'explore',family:'Miura',open:60,yaw:-.55,pitch:.55,animate:false,raf:null,stamp:null,phase:0,pins:['Miura','Kresling'],scenario:{Miura:'EV-0528',Kresling:'EV-0550'},filters:{q:'',scope:'all',family:'all',criterion:'all',level:'all',origin:'all'},page:1,pageSize:15,compare:{a:'Miura',b:'Kresling',key:'C4',ra:'EV-0528',rb:'EV-0550'},plan:{family:'Miura',key:'C4',checked:new Set()},example:false};
const viewNames={demo:'展示デモ',explore:'パターン探索',library:'文献エビデンス',compare:'比較ワークスペース',plan:'調査・検証メモ',about:'出典と研究の範囲'};
let toastTimer;
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3600);}
function navigate(name,updateHash=true){if(!Object.hasOwn(viewNames,name))name='demo';$('visitor-demo').hidden=name!=='demo';$('research-app').hidden=name==='demo';if(name!=='explore')stopAnimation();state.view=name;document.querySelectorAll('[data-section]').forEach(el=>el.hidden=el.dataset.section!==name);document.querySelectorAll('[data-view]').forEach(el=>{if(el.dataset.view===name)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});$('breadcrumb-current').textContent=viewNames[name];if(updateHash&&location.hash!=='#'+name)history.pushState(null,'','#'+name);if(name==='demo')requestAnimationFrame(drawVisitorModels);if(name==='explore')requestAnimationFrame(()=>{drawMain();drawThumbnails();});if(name==='library')renderLibrary();if(name==='compare')renderComparison();if(name==='plan')renderPlan();window.scrollTo({top:0,behavior:'auto'});}
function populateSelect(id,items){const el=$(id);for(const [value,label]of items){const option=document.createElement('option');option.value=value;option.textContent=label;el.append(option);}}
function renderPatternCards(){
 $('pattern-strip').innerHTML=DB.families.map(f=>'<article class="pattern-card'+(f===state.family?' selected':'')+'" data-card="'+f+'"><button type="button" class="select-shape" data-shape="'+f+'" aria-pressed="'+(f===state.family)+'" aria-label="'+familyLabel(f)+'を表示"><canvas class="thumb-canvas" data-thumb="'+f+'" aria-hidden="true"></canvas><strong>'+FAMILY[f].en+'</strong><span class="jp">'+familyLabel(f)+'</span></button><div class="pattern-footer"><span>'+DB.summary.familyCounts[f]+'記録</span><label><input type="checkbox" data-pin="'+f+'" '+(state.pins.includes(f)?'checked':'')+' aria-label="'+familyLabel(f)+'を比較に含める">比較</label></div></article>').join('');
 $('pattern-strip').querySelectorAll('[data-shape]').forEach(b=>b.addEventListener('click',()=>selectFamily(b.dataset.shape)));
 $('pattern-strip').querySelectorAll('[data-pin]').forEach(c=>c.addEventListener('change',()=>{const f=c.dataset.pin;if(c.checked){if(state.pins.length>=2){c.checked=false;toast('比較する候補は2つまでです。先に1つ解除してください。');return;}state.pins.push(f);}else state.pins=state.pins.filter(x=>x!==f);updatePinned();}));
 updatePinned();drawThumbnails();
}
function updatePinned(){$('pinned-label').textContent=state.pins.length+'候補を比較';$('compare-pinned').disabled=state.pins.length!==2;}
const FORM_DESCRIPTION={"Miura":"表示形状：平行四辺形が連続するシート。展開すると平坦になります。","Waterbomb":"表示形状：6本の折り線をもつ基本単位を反復した筒状バリアント。","Flasher":"表示形状：中央の六角形と、つながった6本の螺旋状アーム。","Kresling":"表示形状：同じ向きのねじれと軸方向の伸縮を示す三角形の筒。","Yoshimura":"表示形状：ひし形を反復した蛇腹状の筒。ねじれは累積しません。","Accordion":"表示形状：平行な折り線をもつ蛇腹シート。展開すると平坦になります。"};
function selectFamily(f){stopAnimation();state.family=f;$('shape-description').textContent=FORM_DESCRIPTION[f];$('viewer-name').innerHTML=esc(FAMILY[f].en)+' <small>'+esc(familyLabel(f))+'</small>';$('main-canvas').setAttribute('aria-label',familyLabel(f)+'の模式3D。ドラッグまたは矢印キーで視点を変更できます。');document.querySelectorAll('[data-card]').forEach(el=>{el.classList.toggle('selected',el.dataset.card===f);el.querySelector('[data-shape]').setAttribute('aria-pressed',String(el.dataset.card===f));});renderResearchCard();drawMain();}
function renderResearchCard(){
 const f=state.family,has=f==='Miura'||f==='Kresling',r=has?RECORD[state.scenario[f]]:null;
 let html='<div class="card-top"><span class="eyebrow">LITERATURE EVIDENCE</span><span class="tag '+(has?'E3':'NR')+'">'+(has?'C4 根拠あり':'C4 未評価')+'</span></div><h2>'+esc(familyLabel(f))+'の放熱根拠</h2><div class="record-statline"><span><strong>'+DB.summary.familyCounts[f]+'</strong>この候補の全記録</span><span><strong>'+DB.matrix[f].C4.count+'</strong>C4に対応する記録</span></div>';
 if(has){
  const scenarios=f==='Miura'?[['EV-0528','Miura (1) / 加熱800 W'],['EV-0529','Miura (1) / 加熱1600 W'],['EV-0530','Miura (1) / 加熱2400 W']]:[['EV-0549','支持板のみ / モデル'],['EV-0550','展開状態 / モデル'],['EV-0551','収縮状態 / モデル']];
  html+='<label for="research-scenario">文献で報告された条件を選ぶ</label><select id="research-scenario">'+scenarios.map(([id,label])=>'<option value="'+id+'" '+(id===r.id?'selected':'')+'>'+esc(label)+'</option>').join('')+'</select><div class="reported-result"><span class="result-number">'+(f==='Miura'?'+':'−')+esc(formatValue(r))+'<small> %</small></span>'+tag(r.level)+'</div><div class="result-description">'+(f==='Miura'?'冷却熱流束 / 同じシートの平坦状態比':'加熱体の温度 / フィンなし比')+'</div><div class="mini-source">'+esc(r.id)+' · '+(f==='Miura'?'Ahmed et al. 2023':'Zueter et al. 2024')+'</div><div class="mini-warning">'+(f==='Miura'?'放射加熱後の冷却実験。加熱・折り状態に依存する結果で、温度低下率とは直接比較できません。':'表示の％は数値モデルE2。風洞実験E3もありますが、収縮状態への同じ精度の適用は未確認です。')+'</div><button type="button" class="btn primary" id="open-highlight">この根拠と試験条件を開く ↗</button>';
 }else html+='<div class="nr-explain"><strong>NR</strong><p>このDBでは、放熱性能の根拠を確認できていません。</p><span class="small">「冷えない」「研究が世界中に存在しない」という意味ではありません。</span></div><p class="small">'+esc(FAMILY[f].shape)+'</p><button type="button" class="btn primary" id="open-family-records">この候補の記録を調べる ↗</button>';
 $('research-card').innerHTML=html;
 if(has){$('research-scenario').addEventListener('change',e=>{state.scenario[f]=e.target.value;renderResearchCard();});$('open-highlight').addEventListener('click',()=>openRecord(r.id));}else $('open-family-records').addEventListener('click',()=>openLibrary({family:f}));
}
function openLibrary(filter={}){state.filters={q:'',scope:'all',family:'all',criterion:'all',level:'all',origin:'all',...filter};state.page=1;syncFilterControls();navigate('library');}
function syncFilterControls(){const f=state.filters;$('search-records').value=f.q;$('filter-family').value=f.family;$('filter-criterion').value=f.criterion;$('filter-level').value=f.level;$('filter-origin').value=f.origin;document.querySelectorAll('[data-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scope===f.scope)));}
function renderLibrary(){
 const rows=filteredRecords(state.filters),pages=Math.max(1,Math.ceil(rows.length/state.pageSize));state.page=Math.min(state.page,pages);const start=(state.page-1)*state.pageSize,visible=rows.slice(start,start+state.pageSize);
 $('results-count').textContent=rows.length+'件の記録が一致';$('empty-results').hidden=rows.length!==0;
 $('records-body').innerHTML=visible.map(r=>{const l=LIT[r.literature];return '<tr><td><button class="record-link" data-record="'+esc(r.id)+'" type="button">'+esc(r.id)+'</button><div class="record-pattern" title="'+esc(r.pattern)+'">'+esc(r.family)+' · '+esc(r.pattern)+'</div></td><td><span class="metric-jp">'+esc(metricTitle(r))+'</span><span class="metric-raw">'+esc(r.metric)+'</span></td><td class="value-cell">'+esc(formatValue(r))+' <small>'+esc(r.unit||'')+'</small></td><td>'+tag(r.level)+'<div class="small" style="font-size:9px;margin-top:4px">'+esc(r.validation)+'</div></td><td class="source-cell">'+esc(r.literature)+'<br>'+esc(l.year||'年未記載')+' · '+esc(r.page||'ページ未記載')+'</td><td><button class="button-icon" style="width:26px;height:26px;font-size:13px" data-record="'+esc(r.id)+'" aria-label="'+esc(r.id)+'の詳細を開く">↗</button></td></tr>';}).join('');
 $('records-body').querySelectorAll('[data-record]').forEach(b=>b.addEventListener('click',()=>openRecord(b.dataset.record)));
 $('page-range').textContent=rows.length?(start+1)+'–'+Math.min(start+state.pageSize,rows.length)+' / '+rows.length+'件':'0件';$('page-number').textContent=state.page+' / '+pages;$('previous-page').disabled=state.page===1;$('next-page').disabled=state.page===pages;
}
function fact(label,value,highlight=false){return '<div class="fact'+(highlight?' highlight':'')+'"><dt>'+esc(label)+'</dt><dd>'+esc(textOrMissing(value))+'</dd></div>';}
function openRecord(id){
 const r=RECORD[id];if(!r)return;const l=LIT[r.literature],t=r.thermal?THERM[r.thermal]:null,url=safeURL(l.url);
 $('record-dialog-kicker').textContent=r.id+' / '+r.literature+' / '+r.family;$('record-dialog-title').textContent=metricTitle(r);
 $('record-dialog-body').innerHTML='<div class="dialog-record-grid"><div class="record-detail"><div class="record-value-banner">'+tag(r.level)+'<strong>'+esc(formatValue(r))+' <span style="font-size:16px">'+esc(r.unit||'')+'</span></strong><p>'+esc(r.metric)+'</p></div><dl>'+fact('対象パターン',r.pattern)+fact('研究項目',CRITERIA[r.criterion]?r.criterion+' '+CRITERIA[r.criterion].name:'REF / 参考・対象外')+fact('材料',r.material)+fact('厚さ',r.thickness)+fact('寸法・状態',r.dimensions)+fact('試験・荷重条件',r.conditions)+fact('評価方法',r.method)+fact('検証種別',r.validation)+(t?fact('比較基準',t.baseline):'')+'</dl></div><div><div class="source-card"><span class="eyebrow">SOURCE / 文献マスタ</span><h3>'+esc(l.title)+'</h3><p>'+esc(l.authors)+'</p><p>'+esc(l.year||'出版年未記載')+' · '+esc(l.venue)+'</p><div style="font-size:11px">'+esc(r.page||'ページ未記載')+' / '+esc(r.figure||'図表未記載')+'</div>'+(url?'<a class="btn" style="margin-top:13px" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">原データ記載の出典を開く ↗</a>':'<p class="small" style="margin-top:10px">原データに直接開けるURLはありません。</p>')+'</div><div class="source-location">元ブック：性能エビデンス!A'+r.row+':T'+r.row+'<br>対応付け：ケース適合性・Evidence Coverage!A'+r.indexRow+':P'+r.indexRow+(t?'<br>補足の比較基準：熱・放熱エビデンス!A'+t.row+':Q'+t.row:'')+'</div><h3 style="font-size:13px">比較上の限界</h3><p style="font-size:12px">'+esc(textOrMissing(r.limitation))+'</p><div class="notice"><p>DBの比較ラベル：'+esc(textOrMissing(r.comparability))+'。このラベルは、別候補との直接比較の承認ではありません。</p></div>'+(r.note?'<h3 style="font-size:13px;margin-top:18px">元データの備考</h3><p class="small">'+esc(r.note)+'</p>':'')+'<details style="margin-top:16px"><summary class="small" style="cursor:pointer">文献マスタの注意事項</summary><p class="small" style="margin-top:10px">'+esc(l.note||'未記載')+'</p></details><p class="small" style="margin:18px 0 0">英語の記述は元DBを保持しています。根拠区分はDB作成者の分類で、原著の独立検証は行っていません。</p></div></div>';
 if(!$('record-dialog').open)$('record-dialog').showModal();
}
function setCompareDefaults(){const c=state.compare;const aa=recordsFor(c.a,c.key),bb=recordsFor(c.b,c.key);if(!aa.some(r=>r.id===c.ra))c.ra=aa[0]?.id||null;if(!bb.some(r=>r.id===c.rb))c.rb=bb[0]?.id||null;}
function compareCard(f,key,selected,side){
 const rows=recordsFor(f,key),m=DB.matrix[f][key];let html='<article class="panel"><div class="compare-profile-top"><h2>'+esc(FAMILY[f].en)+'</h2>'+aggregateTag(f,key)+'</div><div class="compare-count">'+esc(familyLabel(f))+' / '+key+' '+CRITERIA[key].name+' / 対応'+m.count+'件</div>';
 if(rows.length){const r=RECORD[selected],t=r.thermal?THERM[r.thermal]:null;html+='<label class="record-picker-label" for="compare-record-'+side+'">比べる記録を選ぶ</label><select id="compare-record-'+side+'">'+rows.map(rr=>'<option value="'+rr.id+'" '+(rr.id===selected?'selected':'')+'>'+rr.id+' · '+esc(metricTitle(rr))+' · '+esc(formatValue(rr))+' '+esc(rr.unit||'')+'</option>').join('')+'</select><dl class="compare-facts">'+fact('根拠の種類',r.level+' / '+r.validation)+fact('報告値',formatValue(r)+(r.unit?' '+r.unit:''),true)+fact('評価指標',r.metric)+fact('比較基準',t?.baseline||'独立した基準欄は未記載。条件・原著を確認')+fact('材料・寸法',[r.material,r.thickness,r.dimensions].filter(Boolean).join(' / '))+fact('試験条件',r.conditions)+fact('出典',r.literature+' / '+r.page)+'</dl><button class="term-button" type="button" data-compare-detail="'+r.id+'">'+r.id+'の限界・出典を開く ↗</button>';
 }else{const c8=DB.c8.find(x=>x.family===f);html+='<div class="nr-explain"><strong>NR</strong><p>'+esc(key==='C8'?'同じ試験体の質量と有効展開面積が揃っていません。':'このDBでは対応する根拠を確認できていません。')+'</p></div><p class="small">'+esc(key==='C8'?c8.reason:(key==='C1'&&f==='Accordion'?FAMILY[f].shape:'未評価は、低性能を意味しません。追加の文献調査・条件整理が必要です。'))+'</p>';}
 return html+'</article>';
}
function renderComparison(){setCompareDefaults();const c=state.compare;$('compare-family-a').value=c.a;$('compare-family-b').value=c.b;$('compare-criterion').value=c.key;$('compare-columns').innerHTML=compareCard(c.a,c.key,c.ra,'a')+compareCard(c.b,c.key,c.rb,'b');for(const side of ['a','b'])$('compare-record-'+side)?.addEventListener('change',e=>{c['r'+side]=e.target.value;renderComparison();});$('compare-columns').querySelectorAll('[data-compare-detail]').forEach(b=>b.addEventListener('click',()=>openRecord(b.dataset.compareDetail)));const result=compareEvidence(c.a,c.b,c.key,RECORD[c.ra],RECORD[c.rb]);$('compare-verdict-title').textContent=result.title;$('compare-verdict-text').textContent=result.text;$('comparison-checks').innerHTML=result.checks.map(s=>'<span>'+esc(s)+'</span>').join('');}
function renderMatrix(){const keys=Object.keys(CRITERIA);$('matrix-head').innerHTML='<tr><th scope="col">候補</th>'+keys.map(k=>'<th scope="col">'+k+'<br>'+CRITERIA[k].short+'</th>').join('')+'</tr>';$('matrix-body').innerHTML=DB.families.map(f=>'<tr><th scope="row">'+FAMILY[f].en+'</th>'+keys.map(k=>{const m=DB.matrix[f][k];return '<td><button type="button" data-cell-family="'+f+'" data-cell-key="'+k+'" aria-label="'+familyLabel(f)+'の'+CRITERIA[k].name+'、'+m.count+'記録を開く">'+aggregateTag(f,k)+'<small>'+(m.count?m.count+'件':'未評価')+'</small></button></td>';}).join('')+'</tr>').join('');$('matrix-body').querySelectorAll('[data-cell-key]').forEach(b=>b.addEventListener('click',()=>openCell(b.dataset.cellFamily,b.dataset.cellKey)));}
function openCell(f,key){const rows=recordsFor(f,key),m=DB.matrix[f][key];$('cell-dialog-title').textContent=familyLabel(f)+' / '+key+' '+CRITERIA[key].name;$('cell-dialog-body').innerHTML='<div class="cell-summary">'+aggregateTag(f,key)+' <strong style="margin-left:9px">'+rows.length+'件の記録</strong><p style="font-size:11px;color:var(--muted);margin:9px 0 0">'+(rows.length?'代表区分はE3→E2→E1の順で表示。＊は提出原稿の図3に示す条件付き、比較未確認は追加項目の未確認状態で、別の意味です。各記録の条件を確認してください。件数は独立試験数や性能順位ではありません。':'NRは、このDBで必要な根拠・変数が不足している状態です。低性能の判定ではありません。')+'</p></div>'+(rows.length?'<div class="cell-records">'+rows.map(r=>'<button type="button" class="cell-record" data-cell-record="'+r.id+'"><span class="record-link">'+r.id+'</span>'+tag(r.level)+'<span class="metric-jp">'+esc(metricTitle(r))+'</span><span class="value-cell">'+esc(formatValue(r))+' '+esc(r.unit||'')+'</span></button>').join('')+'</div>':'<div class="gap-reason">'+esc(key==='C8'?DB.c8.find(x=>x.family===f).reason:CRITERIA[key].tasks.join('。'))+'</div>');$('cell-dialog-body').querySelectorAll('[data-cell-record]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.cellRecord;$('cell-dialog').close();openRecord(id);}));$('cell-dialog').showModal();}
function renderPlan(){const p=state.plan;$('plan-family').value=p.family;$('plan-criterion').value=p.key;const m=DB.matrix[p.family][p.key],r=DB.c8.find(x=>x.family===p.family);$('plan-reason').innerHTML=aggregateTag(p.family,p.key)+' <strong>'+esc(familyLabel(p.family))+' / '+p.key+' '+CRITERIA[p.key].name+'</strong><div style="margin-top:8px">'+esc(p.key==='C8'?r.reason:(m.count?'このDBには対応する記録が'+m.count+'件あります。比較条件と用途への適用範囲は、別途確認が必要です。':'このDBで対応する記録がありません。未評価の理由と必要情報を確認します。'))+'</div>';$('plan-checklist').innerHTML=CRITERIA[p.key].tasks.map((task,i)=>'<li><label><input type="checkbox" data-plan-index="'+i+'" '+(p.checked.has(i)?'checked':'')+'><span>'+esc(task)+'</span></label></li>').join('');$('plan-checklist').querySelectorAll('input').forEach(c=>c.addEventListener('change',()=>{const i=Number(c.dataset.planIndex);if(c.checked)p.checked.add(i);else p.checked.delete(i);planProgress();}));planProgress();}
function planProgress(){$('plan-progress').textContent='メモに含める項目 '+state.plan.checked.size+' / 3（検証の完了数ではありません）';}
function renderAbout(){const s=DB.summary;$('about-stats').innerHTML=[['558','全性能記録 / 26文献'],['375','6候補に関する記録'],['274','6候補のC1〜C8対応分'],['220','総説由来 / 原著確認の制約あり']].map(([a,b])=>'<article class="panel"><strong>'+a+'</strong><span>'+b+'</span></article>').join('');$('literature-list').innerHTML=DB.literature.map(l=>{const url=safeURL(l.url);return '<article class="literature-item"><button type="button" class="record-link" data-literature="'+l.id+'">'+l.id+'</button><div><strong>'+esc(l.title)+'</strong><div class="small">'+esc(l.year||'出版年未記載')+' · '+esc(l.venue)+'</div></div>'+(url?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" class="btn">出典 ↗</a>':'<span class="small">URL未記載</span>')+'</article>';}).join('');$('literature-list').querySelectorAll('[data-literature]').forEach(b=>b.addEventListener('click',()=>openLibrary({q:b.dataset.literature})));$('data-footer').innerHTML='出典ファイル：'+esc(DB.source)+'<br>読込範囲：性能エビデンス558件、文献マスタ26件、対応索引558件、C8正規化監査、熱エビデンスの比較基準。補助シートは件数へ重複加算していません。<br>E1 '+s.levels.E1+'件 / E2 '+s.levels.E2+'件 / E3 '+s.levels.E3+'件。Rawパターン名は'+s.rawPatterns+'種類です（統合マップの旧説明181とは異なります）。<br>元ブックのSHA-256：<code>'+esc(DB.sha256)+'</code>';}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportPlan(){const p=state.plan,m=DB.matrix[p.family][p.key],ids=m.ids;const text=['Origami Evidence Studio / 調査メモ','研究用プロトタイプの出力。順位・採用判定・実験完了証明ではありません。','候補：'+familyLabel(p.family)+' / '+p.family,'項目：'+p.key+' '+CRITERIA[p.key].name,'対応記録：'+m.count+'件 / 代表区分 '+m.level,'比較条件：'+aggregateComparability(p.family,p.key).label,'','調査項目（このデモの提案）：',...(p.checked.size?[...p.checked].sort().map(i=>'・'+CRITERIA[p.key].tasks[i]):['（未選択）']),'','対応するEvidence ID：',ids.length?ids.join(', '):'NR：根拠・変数が不足','', '出典：'+DB.source,'対応付け：ケース適合性・Evidence Coverageの正規化索引。','原著の独立検証は未実施。入力やチェックは文献根拠を更新しません。','原稿では実機の熱実験・MCDA順位付け・利用者評価は未実施。'].join('\r\n');download('origami_research_note_'+p.family+'_'+p.key+'.txt','\ufeff'+text,'text/plain;charset=utf-8');toast('調査メモを保存しました。');}
function invalidateDensity(e){if(e.target.id!=='same-specimen')state.example=false;$('density-result').textContent='入力が変わりました。「面積密度を計算」で再計算してください。';}
function calculateDensity(){const result=density($('mass-input').value,$('area-input').value,$('same-specimen').checked);$('density-result').replaceChildren();if(result.ok){const number=document.createElement('strong');number.textContent=Number(result.value.toPrecision(6)).toLocaleString('ja-JP',{maximumSignificantDigits:6})+' kg/m²';const text=document.createElement('span');text.textContent=(state.example?'架空の教材値：':'入力値：')+$('mass-input').value+' g / '+$('area-input').value+' cm²。'+result.text;$('density-result').append(number,text);}else $('density-result').textContent=result.text;}

function drawMain(){$('shape-open-value').textContent=state.open+' / 100';$('shape-open').value=state.open;renderMesh($('main-canvas'),state.family,state.open,state.yaw,state.pitch);}
function drawThumbnails(){document.querySelectorAll('[data-thumb]').forEach(c=>renderMesh(c,c.dataset.thumb,65,-.55,.6,true));}
function stopAnimation(){if(state.raf!==null)cancelAnimationFrame(state.raf);state.raf=null;state.animate=false;state.stamp=null;$('animate-shape').setAttribute('aria-pressed','false');$('animate-shape').setAttribute('aria-label','図のアニメーションを再生');$('animate-shape').innerHTML='<svg class="icon"><use href="#i-play"/></svg>';}
function startAnimation(){state.animate=true;state.phase=Math.acos(1-2*state.open/100);$('animate-shape').setAttribute('aria-pressed','true');$('animate-shape').setAttribute('aria-label','図のアニメーションを停止');$('animate-shape').innerHTML='<svg class="icon"><use href="#i-pause"/></svg>';const step=t=>{if(!state.animate)return;if(state.stamp===null)state.stamp=t;state.open=Math.round((1-Math.cos(state.phase+(t-state.stamp)/2100))*50);drawMain();state.raf=requestAnimationFrame(step);};state.raf=requestAnimationFrame(step);}
function initCanvas(){const canvas=$('main-canvas');canvas.tabIndex=0;let drag=null;canvas.addEventListener('pointerdown',e=>{stopAnimation();drag={x:e.clientX,y:e.clientY,yaw:state.yaw,pitch:state.pitch};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag)return;state.yaw=drag.yaw+(e.clientX-drag.x)*.009;state.pitch=Math.max(-1.2,Math.min(1.2,drag.pitch+(e.clientY-drag.y)*.008));drawMain();});const end=()=>drag=null;canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();stopAnimation();if(e.key==='Home'){state.yaw=-.55;state.pitch=.55;}else if(e.key==='ArrowLeft')state.yaw-=.15;else if(e.key==='ArrowRight')state.yaw+=.15;else state.pitch=Math.max(-1.2,Math.min(1.2,state.pitch+(e.key==='ArrowUp'?-.12:.12)));drawMain();});new ResizeObserver(()=>{if(state.view==='explore'){drawMain();drawThumbnails();}}).observe($('main-canvas').parentElement);}
function init(){
 const familyOptions=DB.families.map(f=>[f,FAMILY[f].en+' / '+familyLabel(f)]),criterionOptions=Object.keys(CRITERIA).map(k=>[k,k+' '+CRITERIA[k].name]);
 for(const id of ['filter-family','compare-family-a','compare-family-b','plan-family'])populateSelect(id,familyOptions);populateSelect('filter-family',[['other','主候補以外']]);for(const id of ['filter-criterion','compare-criterion','plan-criterion'])populateSelect(id,criterionOptions);populateSelect('filter-criterion',[['REF','REF 参考・対象外']]);
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));window.addEventListener('hashchange',()=>navigate(location.hash.slice(1),false));$('help-button').addEventListener('click',()=>$('help-dialog').showModal());document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
 $('global-search-form').addEventListener('submit',e=>{e.preventDefault();openLibrary({q:$('global-search').value});});$('library-filters').addEventListener('submit',e=>e.preventDefault());$('search-records').addEventListener('input',e=>{state.filters.q=e.target.value;state.page=1;renderLibrary();});for(const [id,key]of [['filter-family','family'],['filter-criterion','criterion'],['filter-level','level'],['filter-origin','origin']])$(id).addEventListener('change',e=>{state.filters[key]=e.target.value;state.page=1;renderLibrary();});document.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>{state.filters.scope=b.dataset.scope;state.page=1;syncFilterControls();renderLibrary();}));$('reset-filters').addEventListener('click',()=>openLibrary());$('previous-page').addEventListener('click',()=>{state.page--;renderLibrary();});$('next-page').addEventListener('click',()=>{state.page++;renderLibrary();});$('export-csv').addEventListener('click',()=>{const records=filteredRecords(state.filters);download('origami_evidence_filtered_'+records.length+'_records.csv',csvFor(records),'text/csv;charset=utf-8');toast(records.length+'件の検索結果を保存しました。');});
 $('compare-pinned').addEventListener('click',()=>{if(state.pins.length!==2)return;const[a,b]=state.pins;state.compare={a,b,key:'C4',ra:a==='Miura'?'EV-0528':a==='Kresling'?'EV-0550':null,rb:b==='Miura'?'EV-0528':b==='Kresling'?'EV-0550':null};navigate('compare');});for(const [id,key]of [['compare-family-a','a'],['compare-family-b','b'],['compare-criterion','key']])$(id).addEventListener('change',e=>{state.compare[key]=e.target.value;state.compare.ra=null;state.compare.rb=null;renderComparison();});$('compare-to-plan').addEventListener('click',()=>{state.plan={family:state.compare.a,key:state.compare.key,checked:new Set()};navigate('plan');});for(const [id,key]of [['plan-family','family'],['plan-criterion','key']])$(id).addEventListener('change',e=>{state.plan[key]=e.target.value;state.plan.checked.clear();renderPlan();});$('export-plan').addEventListener('click',exportPlan);
 $('fill-example').addEventListener('click',()=>{$('mass-input').value='20';$('area-input').value='200';$('same-specimen').checked=false;state.example=true;$('density-result').textContent='架空の教材値を入力しました（20 g / 200 cm²）。同じ試験体という前提を確認してから計算してください。';});for(const id of ['mass-input','area-input','same-specimen'])$(id).addEventListener('input',invalidateDensity);$('calculate-density').addEventListener('click',calculateDensity);
 $('shape-open').addEventListener('input',e=>{stopAnimation();state.open=Number(e.target.value);drawMain();});$('animate-shape').addEventListener('click',()=>state.animate?stopAnimation():startAnimation());$('reset-view').addEventListener('click',()=>{stopAnimation();state.open=60;state.yaw=-.55;state.pitch=.55;drawMain();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAnimation();});const reduced=matchMedia('(prefers-reduced-motion: reduce)');const syncReduced=()=>{if(reduced.matches)stopAnimation();$('animate-shape').disabled=reduced.matches;$('animate-shape').title=reduced.matches?'動きを減らす設定が有効です。スライダーで操作できます。':'';};reduced.addEventListener('change',syncReduced);syncReduced();
 renderPatternCards();renderResearchCard();renderMatrix();renderAbout();syncFilterControls();initCanvas();initVisitor();navigate(location.hash.slice(1)||'demo',false);window.addEventListener('load',()=>{if(state.view==='explore'){drawMain();drawThumbnails();}});
}
init();
