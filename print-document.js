/* Print pages are projections of the live source; project copy has one owner. */
(() => {
  const root = document.createElement('div');
  root.className = 'print-document';
  root.setAttribute('aria-hidden', 'true');
  const clone = (source) => {
    if (!source) throw new Error('Missing print source');
    const node = source.cloneNode(true);
    [node, ...node.querySelectorAll('*')].forEach(el => {
      ['id', 'aria-labelledby', 'aria-controls', 'data-open-detail'].forEach(a => el.removeAttribute(a));
      if (el.tagName === 'IMG') el.loading = 'eager';
      if (el.tagName === 'DETAILS') el.open = true;
    });
    node.querySelectorAll('.case-heading h2 br').forEach(br => br.replaceWith(' '));
    return node;
  };
  const add = (page, selector, context = document) => { const node = clone(context.querySelector(selector)); page.append(node); return node; };
  const page = (label, kind) => {
    const el = document.createElement('section');
    el.className = `print-page ${kind.split(' ').map(name => `print-${name}`).join(' ')}`;
    const header = document.createElement('header');
    header.className = 'print-running';
    header.textContent = `김태민 · Backend Portfolio / ${label}`;
    el.append(header); root.append(el); return el;
  };
  const cover = page('프로젝트 안내', 'cover');
  add(cover, '.hero'); add(cover, '.index');
  for (const id of ['coffee', 'money', 'gong', 'ssafari']) {
    const source = document.getElementById(id);
    const titleNode = clone(source.querySelector('h2'));
    titleNode.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    const title = titleNode.textContent.replace(/\s+/g, ' ').trim();
    const overview = page(`${title} / 요약 · 결과`, `overview ${id}`);
    add(overview, '.case-top', source); add(overview, '.case-heading', source);
    if (id === 'coffee' || id === 'money') add(overview, '.product-figure', source);
    if (id === 'money') add(overview, '.mechanism-flow', source);
    if (id === 'gong') { add(overview, '.lock-results', source); add(overview, '.lock-conditions', source); }
    if (id === 'ssafari') add(overview, '.secondary-performance', source);
    if (id === 'money' || id === 'ssafari') add(overview, '.test-contract', source);
    const detail = page(`${title} / 구현 · 검증`, `detail ${id}`);
    const heading = document.createElement('h2'); heading.textContent = `${title} — 구현과 검증`; detail.append(heading);
    if (id === 'ssafari') add(detail, '.ranking-visual', source);
    else {
      const demo = source.querySelector('.demo-disclosure');
      add(detail, '.demo-summary-title', demo); add(detail, '.demo-note', demo); add(detail, '.print-demo', demo);
    }
    const content = add(detail, '.detail-content', source);
    if (id === 'money' || id === 'ssafari') content.querySelector('.test-contract').remove();
    // The page title and preceding overview already introduce the same problem.
    if (id !== 'coffee') content.querySelector('.detail-lead h3').remove();
  }
  const background = page('이력 · 연락처', 'background');
  add(background, '#about'); add(background, '#contact'); add(background, '.site-footer');
  [...root.children].forEach((el, i) => {
    const footer = document.createElement('footer'); footer.className = 'print-page-number';
    footer.textContent = `${String(i + 1).padStart(2, '0')} / ${root.children.length}`; el.append(footer);
  });
  document.body.append(root);
  document.body.classList.add('print-document-ready');
})();
