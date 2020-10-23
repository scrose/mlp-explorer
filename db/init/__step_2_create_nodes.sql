/* Node map */

DROP TABLE IF EXISTS nodes;

CREATE TABLE IF NOT EXISTS nodes (
  parent_id INT NOT NULL,
  parent_type_id INT NOT NULL,
  child_id INT NOT NULL,
  child_type_id INT NOT NULL,
  unique (parent_id, parent_type_id, child_id, child_type_id),
  CONSTRAINT fk_parent_type_id
    FOREIGN KEY(parent_type_id)
      REFERENCES node_types(id),
  CONSTRAINT fk_child_type_id
    FOREIGN KEY(child_type_id)
      REFERENCES node_types(id)
);

CREATE INDEX parent_index ON nodes (parent_id);
CREATE INDEX child_index ON nodes (child_id);

SELECT * FROM nodes;
