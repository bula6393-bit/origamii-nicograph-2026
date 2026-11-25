let visitorCriterion = 'C4';

function visitorEvidenceCard({name, evidence, value, metric, conditions}) {
  return '<article class="visitor-evidence">' +
    '<header><h3>' + esc(name) + '</h3><span class="visitor-evidence-tag">' + esc(evidence) + '</span></header>' +
    '<strong class="visitor-value">' + esc(value) + '</strong>' +
    '<p class="visitor-metric">' + esc(metric) + '</p>' +
    '<p class="visitor-condition">' + esc(conditions) + '</p></article>';
}

function visitorCase(key) {
  const coverage = DB.families.filter(f => DB.matrix[f][key].count).length;
  const content = {
    C4: {
      left: {
        name:'Miura', evidence:'E3 物理実験',
        value:'+' + RECORD['EV-0530'].value + '～' + RECORD['EV-0528'].value + '%',
        metric:'冷却熱流束の増加',
        conditions:'同じシートの平坦状態と比較 ／ 放射加熱後の冷却［4］'
      },
      right: {
        name:'Kresling', evidence:'E2 数値モデル',
        value:'−' + RECORD['EV-0550'].value + '%',
        metric:'展開時の加熱体の温度低下',
        conditions:'フィンなしと比較 ／ 強制対流下の冷却［6］'
      },
      title:'放熱性能の優劣は判断できない',
      detail:'根拠あり ' + coverage + '/6候補。測ったもの・比較の基準・冷却条件が異なるため、直接比較できません。',
      compare:{a:'Miura',b:'Kresling',ra:'EV-0528',rb:'EV-0550'}
    },
    C1: {
      left: {name:'根拠を確認した候補',evidence:'C1 展開・収納性',value:coverage+'/6',
        metric:'折り方や展開に関する文献記録',conditions:'折り線・形状・折り状態が比較の前提です。'},
      right: {name:'Accordion',evidence:'C1 展開・収納性',value:'NR',
        metric:'このDBでは対応する記録がない',conditions:'折り線の構成と展開状態を示す記録が必要です。'},
      title:'展開できるかは条件を確認',
      detail:'展開の根拠が未評価でも、たためないという判定にはなりません。',
      compare:{a:'Miura',b:'Accordion',ra:null,rb:null}
    },
    C3: {
      left: {name:'根拠を確認した候補',evidence:'C3 構造安定性',value:coverage+'/6',
        metric:'すべての候補に文献記録あり',conditions:'材料・厚さ・固定方法や荷重条件によって結果は変わります。'},
      right: {name:'候補間で比べるには',evidence:'比較条件',value:'共通条件',
        metric:'評価指標と試験条件を揃える',conditions:'剛性・強度など、どの指標で評価するかを決めます。'},
      title:'記録の有無から安定性の優劣は判断できない',
      detail:'この研究では候補間の条件差を分離できず、図3では条件付き（＊）としました。',
      compare:{a:'Miura',b:'Kresling',ra:null,rb:null}
    },
    C8: {
      left: {name:'Miura',evidence:'C8 軽量性',value:'20.78 / 22.24 g',
        metric:'質量の記録あり',conditions:'同じ試験体の有効展開面積が未確認です。'},
      right: {name:'Waterbomb',evidence:'C8 軽量性',value:'9.7 / 22 g',
        metric:'質量の記録あり',conditions:'同じ試験体の有効展開面積が未確認です。'},
      title:'全6候補で未評価（NR）',
      detail:'軽量性の評価には、同じ試験体の質量と有効展開面積が必要です。',
      compare:{a:'Miura',b:'Waterbomb',ra:null,rb:null}
    }
  };
  return content[key];
}

function renderVisitorCase() {
  const result = visitorCase(visitorCriterion);
  document.querySelectorAll('[data-visitor-key]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.visitorKey === visitorCriterion));
  });
  $('visitor-result').innerHTML = '<div class="visitor-cards">' +
    visitorEvidenceCard(result.left) + visitorEvidenceCard(result.right) + '</div>' +
    '<div class="visitor-verdict"><span class="visitor-verdict-icon" aria-hidden="true">i</span>' +
    '<div><strong>' + esc(result.title) + '</strong><p>' + esc(result.detail) + '</p></div></div>';
}

function drawVisitorModels() {
  if (state.view !== 'demo') return;
  renderMesh($('visitor-miura'), 'Miura', 56, -.57, .67);
  renderMesh($('visitor-kresling'), 'Kresling', 75, -.29, .39);
}

function showVisitorComparison(key) {
  state.compare = {...visitorCase(key).compare, key};
  navigate('compare');
}

function initVisitor() {
  renderVisitorCase();
  document.querySelectorAll('[data-visitor-key]').forEach(button => {
    button.addEventListener('click', () => {
      visitorCriterion = button.dataset.visitorKey;
      renderVisitorCase();
    });
  });
  $('visitor-start').addEventListener('click', () => {
    visitorCriterion = 'C4';
    renderVisitorCase();
    $('visitor-case').focus({preventScroll:true});
    $('visitor-case').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  $('visitor-compare').addEventListener('click', () => showVisitorComparison(visitorCriterion));
  $('visitor-gap').addEventListener('click', () => openCell('Waterbomb','C4'));
  $('visitor-matrix').addEventListener('click', () => {
    showVisitorComparison(visitorCriterion);
    $('matrix-heading').focus({preventScroll:true});
    $('matrix-heading').scrollIntoView({block:'start'});
  });
  new ResizeObserver(drawVisitorModels).observe($('visitor-miura'));
}
