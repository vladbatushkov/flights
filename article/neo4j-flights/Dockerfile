FROM neo4j:3.5.12
ENV NEO4JLABS_PLUGINS='["apoc", "graph-algorithms", "graphql"]'
ENV NEO4J_dbms_unmanaged__extension__classes=org.neo4j.graphql=/graphql
ENV NEO4J_AUTH=neo4j/test
CMD [ "neo4j" ]