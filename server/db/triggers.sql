create or replace function rr_audit_trigger() returns trigger as $$
declare
  v_op_id uuid := gen_random_uuid();
  v_entity text := tg_table_name;
  v_entity_id uuid;
  v_payload jsonb;
begin
  if tg_op = 'INSERT' then
    v_entity_id := new.id;
    v_payload := to_jsonb(new);
    insert into audit_log(op_id, entity, entity_id, op_type, payload, device_id, user_id) values(v_op_id, v_entity, v_entity_id, 'insert', v_payload, null, null);
    insert into outbox(op_id) values(v_op_id);
    return new;
  elsif tg_op = 'UPDATE' then
    v_entity_id := new.id;
    v_payload := to_jsonb(new);
    insert into audit_log(op_id, entity, entity_id, op_type, payload, device_id, user_id) values(v_op_id, v_entity, v_entity_id, 'update', v_payload, null, null);
    insert into outbox(op_id) values(v_op_id);
    return new;
  elsif tg_op = 'DELETE' then
    v_entity_id := old.id;
    v_payload := to_jsonb(old);
    insert into audit_log(op_id, entity, entity_id, op_type, payload, device_id, user_id) values(v_op_id, v_entity, v_entity_id, 'delete', v_payload, null, null);
    insert into outbox(op_id) values(v_op_id);
    return old;
  end if;
  return null;
end;
$$ language plpgsql;