create database ITECH3108_30407223_a2;

\c ITECH3108_30407223_a2;

create table users
(
    id       serial
        constraint users_pk
            primary key,
    username varchar(16) not null,
    password varchar(255),
    fullname varchar(32)
);

create table links
(
    id            serial
        constraint links_pk
            primary key,
    link          varchar(255) not null,
    title         varchar(16)  not null,
    describe      varchar(128),
    pub_time      timestamp,
    user_id       integer
        constraint links_users_id_fk
            references users,
    user_fullname varchar(32),
    total_score   integer default 10
);

create table link_score
(
    id      serial
        constraint link_score_pk
            primary key,
    link_id integer not null,
    user_id integer not null,
    score   integer not null
);

create table hidden_link
(
    id      serial
        constraint hidden_link_pk
            primary key,
    link_id integer not null
        constraint hidden_link_links_id_fk
            references links,
    user_id integer not null
        constraint hidden_link_users_id_fk
            references users
);


