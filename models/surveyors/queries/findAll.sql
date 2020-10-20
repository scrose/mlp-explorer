SELECT * FROM surveyors
LEFT OUTER JOIN surveys
ON surveyors.id = surveys.parent_id
WHERE surveys.parent_type_id = (
SELECT id FROM node_types WHERE name = 'surveyors'
)