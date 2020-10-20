/* TRIGGER: Map insertions and updates in nodes table */

CREATE OR REPLACE FUNCTION nodes_update()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS
$$
BEGIN
  UPDATE INTO nodes(parent_id, parent_type_id, child_id, child_type_id)
  VALUES(parent_id, parent_type_id, id, child_type_id);
  RETURN NEW;
END;
$$

CREATE OR REPLACE FUNCTION nodes_insert()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS
$$
BEGIN
  INSERT INTO nodes(parent_id, parent_type_id, child_id, child_type_id)
  VALUES(NEW.parent_id, NEW.parent_type_id, NEW.id, NEW.child_type_id);
  RETURN NEW;
END;
$$
