#!/usr/bin/env python3
"""Consolida a base de NF-e de venda da JJL sem apagar histórico.

Fonte analítica primária: 05_notas_fiscais_venda/notas.csv e itens.csv.
Fonte incremental: arquivos JSON/CSV estruturados dentro de 05_notas_fiscais_venda/YYYY/MM.
XML/originais permanecem como evidência fiscal e podem ser tratados por coletores específicos.

Regras:
- deduplicação por chave de acesso;
- nunca remove registros históricos;
- cancelamento/status posterior atualiza status da mesma chave;
- status/cStat 101 permanece no histórico, mas é excluído do faturamento;
- devolução de compra não compõe faturamento de venda;
- gera faturamento_mensal.csv por unidade/cliente.
"""
from __future__ import annotations

import csv
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "05_notas_fiscais_venda"
NOTAS = BASE / "notas.csv"
ITENS = BASE / "itens.csv"
FAT = BASE / "faturamento_mensal.csv"


def norm(s):
    return "" if s is None else str(s).strip()


def pick(d, *names, default=""):
    low = {str(k).lower(): v for k, v in d.items()}
    for n in names:
        if n.lower() in low and norm(low[n.lower()]):
            return low[n.lower()]
    return default


def read_csv(path):
    if not path.exists():
        return [], []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        return list(r), list(r.fieldnames or [])


def write_csv_atomic(path, rows, fields):
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)
    tmp.replace(path)


def chave(row):
    return norm(pick(row, "chave_acesso", "chave", "chave_nfe", "access_key"))


def numero(row):
    return norm(pick(row, "numero", "numero_nf", "nfe", "nf"))


def status(row):
    return norm(pick(row, "status_sefaz", "cstat", "status"))


def emissao(row):
    return norm(pick(row, "data_hora_emissao", "dhEmi", "data_emissao", "emissao"))


def valor(row):
    raw = norm(pick(row, "valor_total", "vNF", "total", "valor"))
    try:
        return float(raw.replace(".", "").replace(",", ".")) if "," in raw else float(raw or 0)
    except ValueError:
        return 0.0


def unidade(row):
    cnpj = re.sub(r"\D", "", norm(pick(row, "destinatario_cnpj", "cnpj_destinatario", "cnpj")))
    end = norm(pick(row, "endereco_destino", "endereco", "logradouro")).upper()
    nome = norm(pick(row, "destinatario", "razao_social_destinatario", "cliente")).upper()
    if cnpj == "33469164001860" or "SESC" in nome:
        return "SESC"
    if cnpj == "33469172002020" or "GENERAL JUSTO" in end:
        return "SENAC CENTRO"
    if cnpj == "33469172000168" or "AYRTON SENNA 5555" in end:
        return "SENAC BARRA"
    return "OUTROS"


def venda_valida(row):
    st = status(row)
    natureza = norm(pick(row, "natureza_operacao", "natureza", "tipo_operacao")).upper()
    if st == "101" or "CANCEL" in st.upper():
        return False
    if "DEVOLU" in natureza:
        return False
    return st in {"", "100", "AUTORIZADA", "AUTORIZADO"}


def structured_month_files():
    for p in BASE.glob("20??/??/**/*"):
        if p.is_file() and p.suffix.lower() in {".json", ".csv"}:
            yield p


def load_incremental():
    notas, itens = [], []
    for p in structured_month_files():
        try:
            if p.suffix.lower() == ".json":
                obj = json.loads(p.read_text(encoding="utf-8-sig"))
                if isinstance(obj, dict):
                    n = obj.get("nota", obj)
                    if isinstance(n, dict) and chave(n): notas.append(n)
                    its = obj.get("itens", [])
                    if isinstance(its, list): itens.extend(x for x in its if isinstance(x, dict))
            else:
                rows, _ = read_csv(p)
                for r in rows:
                    if chave(r): notas.append(r)
        except Exception as exc:
            print(f"AVISO: ignorado {p}: {exc}")
    return notas, itens


def merge_by_key(existing, incoming):
    order, data = [], {}
    for r in existing + incoming:
        k = chave(r)
        if not k: continue
        if k not in data:
            order.append(k); data[k] = dict(r)
        else:
            # informação posterior/preenchida prevalece sem apagar campos já conhecidos
            for field, val in r.items():
                if norm(val): data[k][field] = val
    return [data[k] for k in order]


def merge_items(existing, incoming):
    def ikey(r):
        return (chave(r), norm(pick(r, "item", "nItem", "numero_item", "codigo")), norm(pick(r, "descricao", "xProd")))
    out, seen = [], set()
    for r in existing + incoming:
        k = ikey(r)
        if not k[0] or k in seen: continue
        seen.add(k); out.append(r)
    return out


def fields_union(original, rows, required):
    fields = list(original)
    for f in required:
        if f not in fields: fields.append(f)
    for r in rows:
        for f in r:
            if f not in fields: fields.append(f)
    return fields


def faturamento(notas):
    agg = defaultdict(lambda: defaultdict(float))
    for n in notas:
        dt = emissao(n)
        mes = dt[:7] if len(dt) >= 7 else "SEM_DATA"
        if venda_valida(n): agg[mes][unidade(n)] += valor(n)
        elif status(n) == "101" or "CANCEL" in status(n).upper(): agg[mes]["CANCELADAS"] += valor(n)
    rows = []
    for mes in sorted(agg):
        a = agg[mes]
        valid = a["SENAC BARRA"] + a["SENAC CENTRO"] + a["SESC"] + a["OUTROS"]
        rows.append({"mes":mes,"senac_barra":f"{a['SENAC BARRA']:.2f}","senac_centro":f"{a['SENAC CENTRO']:.2f}","sesc":f"{a['SESC']:.2f}","outros":f"{a['OUTROS']:.2f}","canceladas":f"{a['CANCELADAS']:.2f}","faturamento_valido":f"{valid:.2f}"})
    return rows


def main():
    notas0, nf = read_csv(NOTAS); itens0, itf = read_csv(ITENS)
    ni, ii = load_incremental()
    notas = merge_by_key(notas0, ni); itens = merge_items(itens0, ii)
    if len(notas) < len(notas0) or len(itens) < len(itens0):
        raise RuntimeError("Proteção de histórico acionada: consolidação reduziria a quantidade de registros")
    nf = fields_union(nf, notas, ["chave_acesso","numero","serie","data_hora_emissao","destinatario","destinatario_cnpj","endereco_destino","valor_produtos","valor_total","status_sefaz"])
    itf = fields_union(itf, itens, ["chave_acesso","numero","item","descricao","quantidade","unidade","preco_unitario","valor_total","ncm","cfop"])
    write_csv_atomic(NOTAS, notas, nf); write_csv_atomic(ITENS, itens, itf)
    fr = faturamento(notas)
    write_csv_atomic(FAT, fr, ["mes","senac_barra","senac_centro","sesc","outros","canceladas","faturamento_valido"])
    print(f"OK: {len(notas)} notas; {len(itens)} itens; {len(fr)} meses consolidados")

if __name__ == "__main__":
    main()
