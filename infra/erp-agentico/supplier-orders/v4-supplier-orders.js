(function(){
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let tab='lista',supplier='',groups=[],lines=[],date='',notes='',draftId=null,oldBtn=null;
const root=()=>document.getElementById('operationBody');
const reasonOptions=['DEMANDA','ESTOQUE','FRETE','AJUSTE'];
function nav(){const n=document.createElement('div');n.className='purchase-nav';n.innerHTML='<div class="purchase-subtabs"><button class="chip" id="supplierOrderBack">Lista de compras</button><button class="chip active">Pedidos a fornecedores</button></div>';root().prepend(n);n.querySelector('#supplierOrderBack').onclick=()=>{tab='lista';window.operation('compras',oldBtn)}}
async function load(){
 tab='pedidos';root().innerHTML='<p class="muted">Carregando fornecedores e rascunhos...</p>';
 try{
 const [d,stored]=await Promise.all([v4api('/admin/shopping-workflow-v4'),v4api('/admin/supplier-orders-v4')]);
 date=String(d.delivery_date||'').slice(0,10);
 const m=new Map();
 for(const x of d.items||[]){
  if(x.workflow_status!=='PENDING')continue;
  const name=x.fornecedor_ult_compra||x.suggested_supplier;
  if(!name)continue;
  if(!m.has(name))m.set(name,[]);
  m.get(name).push({product_key:x.normalized_product,description:x.product_description,
   supplier_description:x.invoice_supplier===name&&x.invoice_product_description?x.invoice_product_description:x.product_description,
   unit:x.unit,requested_quantity:Number(x.suggested_buy_quantity??x.total_required)||0,
   order_quantity:Number(x.suggested_buy_quantity??x.total_required)||0,reason:'DEMANDA'});
 }
 groups=[...m].sort((a,b)=>a[0].localeCompare(b[0],'pt-BR'));
 root().innerHTML='<section class="shop-panel"><div class="shop-title"><div><h2>Pedidos a fornecedores</h2><p>Revise quantidades considerando estoque, preço e frete. Nada é enviado automaticamente.</p></div></div><div id="supplierOrderContent"></div></section>';
 nav();
 const target=document.getElementById('supplierOrderContent');
 target.innerHTML='<label>Fornecedor<select id="orderSupplier"><option value="">Escolher fornecedor</option>'+groups.map(([s,a])=>'<option value="'+esc(s)+'">'+esc(s)+' ('+a.length+' itens)</option>').join('')+'</select></label><div id="orderEditor"></div><h3>Rascunhos salvos</h3><div id="orderSaved">'+(stored.length?stored.map(o=>'<button class="chip" data-draft="'+o.id+'">#'+o.id+' · '+esc(o.supplier_name)+' · '+o.lines.length+' itens</button>').join(' '):'<p class="muted">Nenhum rascunho ainda.</p>')+'</div>';
 target.querySelector('#orderSupplier').onchange=e=>{supplier=e.target.value;draftId=null;lines=structuredClone(groups.find(x=>x[0]===supplier)?.[1]||[]);notes='';renderEditor()};
 target.querySelectorAll('[data-draft]').forEach(b=>b.onclick=()=>{const o=stored.find(x=>String(x.id)===b.dataset.draft);supplier=o.supplier_name;date=String(o.delivery_date).slice(0,10);draftId=o.id;notes=o.notes;lines=structuredClone(o.lines);target.querySelector('#orderSupplier').value=groups.some(x=>x[0]===supplier)?supplier:'';renderEditor()});
 }catch(e){root().innerHTML='<p class="notice">Erro ao carregar pedidos: '+esc(e.message)+'</p>'}
}
function message(){return 'PEDIDO DE COMPRA — JJL DISTRIBUIDORA\nFornecedor: '+supplier+'\n\n'+lines.filter(x=>x.order_quantity>0).map((x,i)=>(i+1)+'. '+x.supplier_description+' — '+x.order_quantity+' '+x.unit).join('\n')+'\n\n'+notes+'\nFavor confirmar preço, disponibilidade e frete.'}
function renderEditor(){
 const e=document.getElementById('orderEditor');if(!e)return;
 if(!supplier){e.innerHTML='<p class="muted">Selecione um fornecedor ou abra um rascunho salvo.</p>';return}
 e.innerHTML='<h3>'+esc(supplier)+(draftId?' · Rascunho #'+draftId:' · Novo rascunho')+'</h3><p class="muted">Entrega de referência: '+esc(date)+' · Quantidade zero retira o item do pedido, sem alterar a lista de compras.</p>'+
 lines.map((x,i)=>'<div class="card" style="padding:12px;margin:8px 0"><strong>'+esc(x.description)+'</strong><label>Descrição para o fornecedor<input data-desc="'+i+'" value="'+esc(x.supplier_description)+'"></label><div style="display:flex;gap:10px;flex-wrap:wrap"><label>Quantidade<input type="number" min="0" step="0.001" data-qty="'+i+'" value="'+x.order_quantity+'" style="max-width:110px"></label><label>Unidade<input value="'+esc(x.unit)+'" disabled style="max-width:90px"></label><label>Motivo<select data-reason="'+i+'">'+reasonOptions.map(r=>'<option '+(r===x.reason?'selected':'')+'>'+r+'</option>').join('')+'</select></label></div><small>Demanda sugerida: '+x.requested_quantity+' '+esc(x.unit)+'</small></div>').join('')+
 '<label>Observações (estoque, frete, negociação)<textarea id="orderNotes" rows="3">'+esc(notes)+'</textarea></label><div style="display:flex;flex-wrap:wrap;gap:8px"><button class="chip" id="orderSave">Salvar rascunho</button><button class="chip" id="orderCopy">Copiar pedido</button></div><p class="muted">Copiar não significa enviado. Envio e confirmação serão etapas separadas.</p>';
 e.querySelectorAll('[data-qty]').forEach(el=>el.onchange=()=>{const n=Number(el.value);if(Number.isFinite(n)&&n>=0)lines[+el.dataset.qty].order_quantity=n;else{alert('Quantidade inválida');el.value=lines[+el.dataset.qty].order_quantity}});
 e.querySelectorAll('[data-desc]').forEach(el=>el.onchange=()=>lines[+el.dataset.desc].supplier_description=el.value.trim());
 e.querySelectorAll('[data-reason]').forEach(el=>el.onchange=()=>lines[+el.dataset.reason].reason=el.value);
 e.querySelector('#orderNotes').onchange=el=>notes=el.target.value;
 e.querySelector('#orderCopy').onclick=()=>{notes=e.querySelector('#orderNotes').value;for(const el of e.querySelectorAll('[data-desc]'))lines[+el.dataset.desc].supplier_description=el.value.trim();navigator.clipboard.writeText(message()).then(()=>alert('Texto copiado. Envie pelo canal de sua preferência.')).catch(()=>alert('Não foi possível copiar.'))};
 e.querySelector('#orderSave').onclick=async()=>{notes=e.querySelector('#orderNotes').value;for(const el of e.querySelectorAll('[data-desc]'))lines[+el.dataset.desc].supplier_description=el.value.trim();if(lines.some(x=>!x.supplier_description||!Number.isFinite(x.order_quantity)||x.order_quantity<0)){alert('Revise descrições e quantidades');return}const btn=e.querySelector('#orderSave');btn.disabled=true;try{const result=await v4api('/admin/supplier-orders-v4'+(draftId?'/'+draftId:''),{method:draftId?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({supplier_name:supplier,delivery_date:date,notes,lines})});draftId=result.id;alert('Rascunho #'+draftId+' salvo. Nenhum pedido foi enviado.');renderEditor()}catch(err){alert('Erro ao salvar: '+err.message);btn.disabled=false}};
}
const obs=new MutationObserver(()=>{const r=root();if(!r||window.currentOp!=='compras'||tab==='pedidos')return;const n=r.querySelector('.purchase-subtabs');if(n&&!n.querySelector('#supplierOrdersTab')){const b=document.createElement('button');b.className='chip';b.id='supplierOrdersTab';b.textContent='Pedidos';b.onclick=()=>{oldBtn=window._purchaseBtn||document.querySelector('#operarTabs button[onclick*="compras"]');load()};n.append(b)}});
obs.observe(root(),{childList:true,subtree:true});
const prev=window.operation;window.operation=function(type,btn){if(type==='compras'&&tab==='pedidos'){tab='lista'}return prev(type,btn)};
})();