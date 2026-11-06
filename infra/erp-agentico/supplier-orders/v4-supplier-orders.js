(function () {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  const fmt = new Intl.NumberFormat('pt-BR', {maximumFractionDigits: 9});
  const api = '/admin/supplier-orders-v4';
  const root = () => document.getElementById('operationBody');
  const reasons = ['DEMANDA', 'ESTOQUE', 'FRETE', 'AJUSTE'];
  const measures = ['g', 'kg', 'mL', 'L', 'un'];
  let active = false, generation = 0, purchaseButton;
  const catalogs = new Map();

  function presentation(label, sizeText, unit, countText) {
    const size = Number(String(sizeText).replace(',', '.'));
    const count = Number(countText);
    if (!label.trim() || !/^\d+(?:[.,]\d{1,6})?$/.test(sizeText) ||
        !measures.includes(unit) || !/^\d+$/.test(countText) ||
        size <= 0 || size > 1000000 || count < 1 || count > 1000000 ||
        (unit === 'un' && !Number.isInteger(size))) return null;
    const total = Math.round(size * 1e6) * count / (['g', 'mL'].includes(unit) ? 1e9 : 1e6);
    if (total > 1000000) return null;
    return {label: label.trim(), size: String(sizeText).replace(',', '.'), unit, count,
      total, totalUnit: {g:'kg', mL:'L'}[unit] || unit};
  }

  function message(supplier, items, notes) {
    return [
      'PEDIDO DE COMPRA — JJL DISTRIBUIDORA',
      `Fornecedor: ${supplier}`, '',
      ...items.map(({supplier_description, presentation: p}, index) =>
        `${index + 1}. ${supplier_description} — ${fmt.format(p.count)} × ${p.label} de ${fmt.format(Number(p.size))} ${p.unit} — total ${fmt.format(p.total)} ${p.totalUnit}`),
      '', notes, 'Favor confirmar apresentação, quantidade de embalagens, preço, disponibilidade e frete.'
    ].join('\n');
  }

  function invoiceCatalog(name) {
    if (!catalogs.has(name)) {
      catalogs.set(name, v4api(`${api}/invoice-products?supplier=${encodeURIComponent(name)}`)
        .catch(error => { catalogs.delete(name); throw error; }));
    }
    return catalogs.get(name);
  }

  async function load() {
    active = true;
    const version = ++generation;
    root().innerHTML = `
      <nav class="purchase-nav"><div class="purchase-subtabs">
        <button class="chip" id="supplierOrderBack">Lista de compras</button>
        <button class="chip active" aria-current="page">Pedidos</button>
      </div></nav>
      <section class="shop-panel so-panel">
        <header><h2>Pedidos a fornecedores</h2><p>Confirme a apresentação e o número de embalagens de cada item antes de copiar o pedido.</p></header>
        <div id="supplierOrderContent" aria-live="polite">Carregando fornecedores e rascunhos…</div>
      </section>`;
    root().querySelector('#supplierOrderBack').onclick = () => window.operation('compras', purchaseButton);
    const content = root().querySelector('#supplierOrderContent');
    try {
      const [shopping, drafts] = await Promise.all([v4api('/admin/shopping-workflow-v4'), v4api(api)]);
      if (generation !== version) return;
      const groups = new Map();
      for (const item of shopping.items || []) {
        const supplier = item.fornecedor_ult_compra || item.suggested_supplier;
        if (item.workflow_status !== 'PENDING' || !supplier) continue;
        if (!groups.has(supplier)) groups.set(supplier, []);
        const demand = Number(item.suggested_buy_quantity ?? item.total_required) || 0;
        groups.get(supplier).push({
          product_key: item.normalized_product, description: item.product_description,
          supplier_description: item.invoice_supplier === supplier ? item.invoice_product_description || '' : '',
          unit: item.unit, requested_quantity: demand, order_quantity: demand, reason: 'DEMANDA',
          excluded: false
        });
      }
      const names = [...groups.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
      content.innerHTML = `<div class="so-start">
        <label>Novo pedido por fornecedor<select id="orderSupplier">
          <option value="">Escolher fornecedor</option>
          ${names.map(name => `<option value="${esc(name)}">${esc(name)} (${groups.get(name).length} itens)</option>`).join('')}
        </select></label>
        <label>Rascunhos salvos<select id="orderSaved">
          <option value="">${drafts.length ? 'Abrir um rascunho' : 'Nenhum rascunho salvo'}</option>
        </select></label>
      </div><div id="orderEditor"></div>`;
      const supplierSelect = content.querySelector('#orderSupplier');
      const saved = content.querySelector('#orderSaved');
      const editor = content.querySelector('#orderEditor');
      function updateSaved(selected = '') {
        saved.querySelectorAll('option:not(:first-child)').forEach(option => option.remove());
        saved.options[0].textContent = drafts.length ? 'Abrir um rascunho' : 'Nenhum rascunho salvo';
        drafts.forEach(draft => saved.add(new Option(
          `#${draft.id} · ${draft.supplier_name} · ${draft.lines.length} itens`, draft.id)));
        saved.value = selected;
      }
      updateSaved();
      let selection = 0;
      async function open(draft) {
        const token = ++selection;
        if (!draft) { editor.replaceChildren(); return; }
        editor.textContent = 'Consultando descrições nas notas fiscais…';
        let catalog = [], catalogError = false;
        try { catalog = await invoiceCatalog(draft.supplier_name); }
        catch { catalogError = true; }
        if (token !== selection || generation !== version) return;
        renderEditor(editor, structuredClone(draft), catalog, catalogError, result => {
          const index = drafts.findIndex(old => old.id === result.id);
          if (index === -1) drafts.unshift(result);
          else drafts[index] = result;
          updateSaved(result.id);
        });
      }
      supplierSelect.onchange = () => {
        saved.value = '';
        const name = supplierSelect.value;
        open(name && {supplier_name: name, delivery_date: shopping.delivery_date, notes: '', lines: groups.get(name)});
      };
      saved.onchange = () => {
        supplierSelect.value = '';
        open(drafts.find(draft => String(draft.id) === saved.value));
      };
    } catch (error) {
      if (generation === version) content.textContent = `Erro ao carregar pedidos. ${error.message}`;
    }
  }

  function invoiceMeasure(description) {
    const tokens = [...description.matchAll(/(?:^|[^\d.,])(\d+(?:[.,]\d{1,6})?)\s*(KG|GR|G|ML|L)\b/gi)];
    if (tokens.length !== 1) return null;
    const [, size, unit] = tokens[0];
    return {size, unit: {KG:'kg', GR:'g', G:'g', ML:'mL', L:'L'}[unit.toUpperCase()]};
  }

  const ignoredWords = new Set(['com', 'sem', 'para', 'das', 'dos', 'por', 'uma', 'und', 'unid', 'pct', 'ml', 'kg', 'gr']);
  function productWords(value) {
    return new Set((String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
      .match(/\p{L}[\p{L}\p{N}]*/gu) || [])
      .filter(word => word.length >= 3 && !ignoredWords.has(word)));
  }

  function invoiceOptions(line, catalog) {
    const requestedWords = productWords(line.description);
    const candidates = catalog.flatMap(item => {
      const words = productWords(item.description);
      const overlap = [...requestedWords].filter(word => words.has(word)).length;
      return overlap ? [{item, overlap}] : [];
    }).sort((a, b) => b.overlap - a.overlap || a.item.description.localeCompare(b.item.description, 'pt-BR'));
    const current = catalog.find(item => String(item.id) === String(line.invoice_item_id));
    const option = item => `<option value="${esc(item.id)}">${esc(item.description)} · NF ${esc(item.invoice_number)}${item.product_code ? ` · cód. ${esc(item.product_code)}` : ''}</option>`;
    const matches = candidates.filter(({item}) => item.normalized_product === line.product_key);
    const related = candidates.filter(({item}) => item.normalized_product !== line.product_key);
    const saved = current && !candidates.some(({item}) => item === current);
    return `<option value="">${candidates.length ? 'Selecionar descrição da NF' : 'Nenhuma descrição da NF com palavra em comum'}</option>
      ${matches.length ? `<optgroup label="Mesmo produto normalizado">${matches.map(({item}) => option(item)).join('')}</optgroup>` : ''}
      ${related.length ? `<optgroup label="Descrições com palavras em comum">${related.map(({item}) => option(item)).join('')}</optgroup>` : ''}
      ${saved ? `<optgroup label="Descrição já vinculada ao rascunho">${option(current)}</optgroup>` : ''}`;
  }

  function renderEditor(editor, draft, catalog, catalogError, onSaved) {
    editor.innerHTML = `
      <div class="so-heading"><h3>${esc(draft.supplier_name)}</h3>
        <p><span id="so-draft">${draft.id ? `Rascunho #${esc(draft.id)}` : 'Novo rascunho'}</span> · Entrega de referência ${esc(String(draft.delivery_date).slice(0, 10).split('-').reverse().join('/'))}</p>
      </div>
      ${catalogError ? '<p class="notice">Consulta às NFs indisponível. Reabra o rascunho ou fornecedor para tentar novamente.</p>' : ''}
      ${draft.lines.map((line, i) => {
        const p = line.presentation || line.presentation_draft || {};
        const legacyQuantity = !line.presentation && line.presentation_draft == null && line.order_quantity > 0 && draft.id;
        return `<article class="so-card" data-line="${i}">
          <div class="so-card-head"><div><h4>${esc(line.description)}</h4>
            <p>Demanda sugerida · ${fmt.format(line.requested_quantity)} ${esc(line.unit)}</p></div>
            <label class="so-check"><input type="checkbox" data-excluded ${line.excluded || (line.excluded == null && line.order_quantity === 0) ? 'checked' : ''}> Retirar item</label>
          </div>
          <fieldset data-fields aria-label="Detalhes de ${esc(line.description)}">
            ${catalog.length ? `<label>Descrição na nota fiscal<select data-invoice>${invoiceOptions(line, catalog)}</select></label>` : ''}
            <label>Descrição para o fornecedor<textarea data-description rows="2" maxlength="500" placeholder="Confirme o nome comercial com o fornecedor">${esc(line.supplier_description)}</textarea></label>
            <p class="so-source" data-source></p>
            <button type="button" class="chip so-nf-size" data-nf-size hidden></button>
            ${legacyQuantity ? `<p class="so-source">Quantidade do rascunho anterior · ${fmt.format(line.order_quantity)} ${esc(line.unit)}. Confirme a embalagem.</p>` : ''}
            <div class="so-grid">
              <label>Embalagem<input data-label maxlength="80" value="${esc(p.label)}" placeholder="Ex. pote"></label>
              <label>Conteúdo por embalagem<span class="so-size">
                <input data-size inputmode="decimal" aria-label="Conteúdo por embalagem" maxlength="16" value="${esc(p.size)}" placeholder="Ex. 320">
                <select data-unit aria-label="Unidade por embalagem"><option value="">Unidade</option>${measures.map(unit => `<option ${unit === p.unit ? 'selected' : ''}>${unit}</option>`).join('')}</select>
              </span></label>
              <label>Nº de embalagens<input data-count inputmode="numeric" maxlength="7" value="${esc(p.count)}" placeholder="Ex. 10"></label>
              <label>Motivo do ajuste<select data-reason>${reasons.map(reason => `<option ${reason === line.reason ? 'selected' : ''}>${reason}</option>`).join('')}</select></label>
            </div>
            <label class="so-check"><input type="checkbox" data-confirm ${line.presentation ? 'checked' : ''}> Confirmo a apresentação e o conteúdo por embalagem</label>
            <div class="so-total" aria-live="polite"><span>Total do item</span><strong data-total></strong></div>
          </fieldset>
        </article>`;
      }).join('')}
      <label>Observações<textarea id="orderNotes" rows="3" maxlength="1500">${esc(draft.notes)}</textarea></label>
      <footer class="so-actions">
        <button class="chip" id="orderSave">Salvar rascunho</button>
        <button class="chip" id="orderCopy">Copiar para WhatsApp</button>
        <p id="so-status" role="status"></p>
      </footer>`;
    const cards = [...editor.querySelectorAll('[data-line]')];
    const status = editor.querySelector('#so-status');
    const copy = editor.querySelector('#orderCopy');
    const save = editor.querySelector('#orderSave');
    const invoiceById = new Map(catalog.map(item => [String(item.id), item]));
    const invoiceIds = draft.lines.map(line => line.invoice_item_id || null);
    const field = (card, key) => card.querySelector(`[data-${key}]`);
    function read() {
      return cards.map((card, i) => {
        const spec = {
          label: field(card, 'label').value, size: field(card, 'size').value,
          unit: field(card, 'unit').value, count: field(card, 'count').value
        };
        const p = presentation(spec.label, spec.size, spec.unit, spec.count);
        const excluded = field(card, 'excluded').checked;
        const confirmed = field(card, 'confirm').checked;
        const old = draft.lines[i];
        const line = {...old, supplier_description: field(card, 'description').value.trim().replace(/\s+/g, ' '),
          invoice_item_id: invoiceIds[i], reason: field(card, 'reason').value, excluded,
          presentation_draft: spec, presentation: confirmed ? p : null,
          order_quantity: excluded ? 0 : (confirmed && p ? p.total : old.order_quantity),
          order_unit: confirmed && p ? p.totalUnit : null};
        field(card, 'fields').disabled = excluded;
        field(card, 'total').textContent = excluded ? 'Retirado' : p ? `${fmt.format(p.total)} ${p.totalUnit}` : 'A calcular';
        const source = invoiceById.get(String(invoiceIds[i]));
        const measure = source && invoiceMeasure(source.description);
        const suggestion = field(card, 'nf-size');
        suggestion.hidden = !measure;
        if (measure) suggestion.textContent = `Usar conteúdo indicado na NF · ${measure.size} ${measure.unit}`;
        field(card, 'source').textContent = source ? `Descrição da NF ${source.invoice_number}` :
          invoiceIds[i] ? 'Descrição de NF vinculada ao rascunho' : 'Descrição comercial a confirmar ou selecionar na NF';
        return line;
      });
    }
    function review() {
      const lines = read().filter(line => !line.excluded);
      const pending = lines.filter(line => !line.presentation || !line.supplier_description).length;
      const conflict = lines.find(line => {
        if (!line.presentation) return false;
        const stated = invoiceMeasure(line.supplier_description);
        if (!stated) return false;
        const described = presentation('embalagem', stated.size, stated.unit, '1');
        const chosen = presentation('embalagem', line.presentation.size, line.presentation.unit, '1');
        return described && (described.totalUnit !== chosen.totalUnit || described.total !== chosen.total);
      });
      copy.disabled = !lines.length || pending > 0 || Boolean(conflict);
      status.textContent = !lines.length ? 'Inclua pelo menos um item para copiar.' :
        conflict ? `O conteúdo na descrição de ${conflict.description} difere da embalagem. Confira os dois campos.` :
        pending ? `${pending} ${pending === 1 ? 'item precisa' : 'itens precisam'} de descrição e embalagem confirmada.` :
          'Pedido pronto para copiar.';
      return lines;
    }
    cards.forEach((card, i) => {
      field(card, 'nf-size').onclick = () => {
        const source = invoiceById.get(String(invoiceIds[i]));
        const measure = source && invoiceMeasure(source.description);
        if (!measure) return;
        field(card, 'size').value = measure.size;
        field(card, 'unit').value = measure.unit;
        field(card, 'confirm').checked = false;
        review();
      };
      const invoice = field(card, 'invoice');
      if (invoice) {
        invoice.value = invoiceById.has(String(invoiceIds[i])) ? String(invoiceIds[i]) : '';
        invoice.onchange = () => {
          const item = invoiceById.get(invoice.value);
          if (item) field(card, 'description').value = item.description;
          invoiceIds[i] = item?.id || null;
          field(card, 'confirm').checked = false;
          review();
        };
      }
      card.addEventListener('input', event => {
        const target = event.target;
        if (target === field(card, 'description')) {
          invoiceIds[i] = null;
          if (invoice) invoice.value = '';
        }
        if (['label', 'size', 'unit', 'description'].some(key => target === field(card, key))) {
          field(card, 'confirm').checked = false;
        }
        review();
      });
    });
    copy.onclick = async () => {
      const lines = review();
      if (copy.disabled) return;
      try {
        await navigator.clipboard.writeText(message(draft.supplier_name, lines, editor.querySelector('#orderNotes').value));
        status.textContent = 'Mensagem copiada para colar no WhatsApp.';
      } catch {
        status.textContent = 'O navegador não conseguiu copiar a mensagem.';
      }
    };
    save.onclick = async () => {
      const notes = editor.querySelector('#orderNotes').value;
      const lines = read();
      save.disabled = true;
      try {
        const result = await v4api(api + (draft.id ? `/${draft.id}` : ''), {
          method: draft.id ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({...draft, notes, lines})
        });
        draft.id = result.id;
        onSaved({...draft, notes, lines});
        editor.querySelector('#so-draft').textContent = `Rascunho #${draft.id}`;
        status.textContent = `Rascunho #${draft.id} salvo.`;
      } catch (error) {
        status.textContent = `Erro ao salvar. ${error.message}`;
      } finally {
        save.disabled = false;
      }
    };
    review();
  }

  const observer = new MutationObserver(() => {
    if (window.currentOp !== 'compras' || active) return;
    const nav = root().querySelector('.purchase-subtabs');
    if (!nav || nav.querySelector('#supplierOrdersTab')) return;
    const button = document.createElement('button');
    button.className = 'chip';
    button.id = 'supplierOrdersTab';
    button.textContent = 'Pedidos';
    button.onclick = () => {
      purchaseButton = window._purchaseBtn || document.querySelector('#operarTabs button[onclick*="compras"]');
      load();
    };
    nav.append(button);
  });
  observer.observe(root(), {childList:true, subtree:true});
  const operation = window.operation;
  window.operation = function (type, button) {
    active = false;
    generation++;
    return operation.call(this, type, button);
  };
})();
