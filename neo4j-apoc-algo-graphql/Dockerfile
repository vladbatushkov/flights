FROM neo4j:3.5.12

ADD neo4j.conf /var/lib/neo4j/conf/neo4j.conf

ENV APOC_VERSION=3.5.0.5
ENV APOC_URI=https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/${APOC_VERSION}/apoc-${APOC_VERSION}-all.jar

ENV ALGO_VERSION=3.5.4.0
ENV GRAPH_ALGORITHMS_URI=https://github.com/neo4j-contrib/neo4j-graph-algorithms/releases/download/${ALGO_VERSION}/graph-algorithms-algo-${ALGO_VERSION}.jar

ENV GRAPHQL_VERSION=3.5.0.4
ENV GRAPHQL_URI=https://github.com/neo4j-graphql/neo4j-graphql/releases/download/${GRAPHQL_VERSION}/neo4j-graphql-${GRAPHQL_VERSION}.jar

# install wget
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

RUN wget $APOC_URI && mv apoc-${APOC_VERSION}-all.jar plugins/apoc-${APOC_VERSION}-all.jar
RUN wget $GRAPH_ALGORITHMS_URI && mv graph-algorithms-algo-${ALGO_VERSION}.jar plugins/graph-algorithms-algo-${ALGO_VERSION}.jar
RUN wget $GRAPHQL_URI && mv neo4j-graphql-${GRAPHQL_VERSION}.jar plugins/neo4j-graphql-${GRAPHQL_VERSION}.jar

EXPOSE 7474 7473 7687

CMD [ "neo4j" ]