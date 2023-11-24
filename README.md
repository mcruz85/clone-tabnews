# clone-tabnews

Implementação do https://www.tabnews.com.br/ para o curso https://curso.devgit

# Testes automatizados

# DOCKER

docker compose --file infra/compose.yaml up -d --remove-orphans --force-recreate

docker container exec -it infra-database-1 /bin/bash

psql --host=localhost --username=local_user --port=5432 --dbname=tabnews

# Postgres

Usually you can run the following command to enter into psql:

psql DBNAME USERNAME
For example, psql template1 postgres

One situation you might have is: suppose you login as root, and you don't remember the database name. You can just enter first into Psql by running:

sudo -u postgres psql
In some systems, sudo command is not available, you can instead run either command below:

psql -U postgres
psql --username=postgres 2. Show tables

Now in Psql you could run commands such as:

\? list all the commands
\l list databases
\conninfo display information about current connection
\c [DBNAME] connect to new database, e.g., \c template1
\dt list tables of the public schema
\dt <schema-name>._ list tables of certain schema, e.g., \dt public._
\dt _._ list tables of all schemas
Then you can run SQL statements, e.g., SELECT \* FROM my_table;(Note: a statement must be terminated with semicolon ;)
\q quit psql
