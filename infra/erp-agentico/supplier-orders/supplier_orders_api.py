"""Rascunhos de pedidos a fornecedores. Nunca envia mensagens automaticamente."""
import json
import psycopg
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from auth_api import session_user
from finance_dda import DB_DSN

router=APIRouter(prefix="/admin/supplier-orders-v4",tags=["Pedidos a fornecedores"])
class Line(BaseModel):
    product_key:str=Field(min_length=1,max_length=300)
    description:str=Field(min_length=1,max_length=500)
    supplier_description:str=Field(min_length=1,max_length=500)
    unit:str=Field(min_length=1,max_length=30)
    requested_quantity:float=Field(ge=0,le=1000000)
    order_quantity:float=Field(ge=0,le=1000000)
    reason:str=Field(default="DEMANDA",pattern="^(DEMANDA|ESTOQUE|FRETE|AJUSTE)$")
class Draft(BaseModel):
    supplier_name:str=Field(min_length=1,max_length=250)
    delivery_date:str=Field(min_length=10,max_length=10)
    notes:str=Field(default="",max_length=1500)
    lines:list[Line]=Field(min_length=1,max_length=300)
def actor(request):
    user=session_user(request)
    if not user:raise HTTPException(401,"Sessao necessaria")
    return str(user["id"])
def setup(cur):
    cur.execute("""CREATE TABLE IF NOT EXISTS procurement.supplier_order_drafts_jjl(
        id bigserial PRIMARY KEY,supplier_name text NOT NULL,delivery_date date NOT NULL,
        notes text NOT NULL DEFAULT '',lines jsonb NOT NULL,
        status text NOT NULL DEFAULT 'RASCUNHO',created_by text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now())""")
@router.get("")
def list_drafts(request:Request):
    actor(request)
    with psycopg.connect(DB_DSN) as conn:
        with conn.cursor() as cur:
            setup(cur)
            cur.execute("SELECT id,supplier_name,delivery_date,notes,lines,status,created_at,updated_at FROM procurement.supplier_order_drafts_jjl ORDER BY id DESC LIMIT 100")
            cols=[d.name for d in cur.description]
            return [dict(zip(cols,row)) for row in cur.fetchall()]
@router.post("")
def save_draft(data:Draft,request:Request):
    who=actor(request)
    from datetime import date
    try:day=date.fromisoformat(data.delivery_date)
    except ValueError:raise HTTPException(400,"Data invalida")
    if not data.supplier_name.strip():raise HTTPException(400,"Fornecedor obrigatorio")
    with psycopg.connect(DB_DSN) as conn:
        with conn.cursor() as cur:
            setup(cur)
            cur.execute("""INSERT INTO procurement.supplier_order_drafts_jjl
                (supplier_name,delivery_date,notes,lines,created_by)
                VALUES(%s,%s,%s,%s::jsonb,%s) RETURNING id""",
                (data.supplier_name.strip(),day,data.notes,json.dumps([x.model_dump() for x in data.lines]),who))
            return {"id":cur.fetchone()[0],"status":"RASCUNHO"}
@router.put("/{order_id}")
def update_draft(order_id:int,data:Draft,request:Request):
    actor(request)
    with psycopg.connect(DB_DSN) as conn:
        with conn.cursor() as cur:
            setup(cur)
            cur.execute("""UPDATE procurement.supplier_order_drafts_jjl
                SET supplier_name=%s,notes=%s,lines=%s::jsonb,updated_at=now()
                WHERE id=%s AND status='RASCUNHO' RETURNING id""",
                (data.supplier_name.strip(),data.notes,json.dumps([x.model_dump() for x in data.lines]),order_id))
            if not cur.fetchone():raise HTTPException(404,"Rascunho nao encontrado ou bloqueado")
    return {"id":order_id,"status":"RASCUNHO"}
