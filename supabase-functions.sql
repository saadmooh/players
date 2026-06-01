CREATE OR REPLACE FUNCTION get_distinct_field_values(field_name TEXT)
RETURNS TABLE(value TEXT) AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT DISTINCT data->>%L FROM players WHERE data->>%L IS NOT NULL AND data->>%L <> %L ORDER BY 1',
    field_name, field_name, field_name, ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
