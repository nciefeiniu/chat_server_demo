CREATE DATABASE "ITECH3108_30407210_a2" IF NOT EXISTS;

\connect "ITECH3108_30407210_a2"

create table public.users
(
    id       integer default nextval('user_id_seq'::regclass) not null
        constraint user_pk
            primary key,
    username varchar(32)                                      not null,
    password varchar(255)                                     not null
);


create table public.links
(
    id      serial
        constraint links_pk
            primary key,
    link    varchar(255) not null,
    title   varchar(32)  not null,
    "desc"  varchar(255),
    score   double precision default 0,
    user_id integer      not null
        constraint links_users_id_fk
            references users
);

create table public.score_detail
(
    id      serial
        constraint score_detail_pk
            primary key,
    link_id integer not null
        constraint score_detail_links_id_fk
            references links,
    user_id integer not null
        constraint score_detail_users_id_fk
            references users,
    score   integer
);


create table public.good_link
(
    id      serial
        constraint good_link_pk
            primary key,
    user_id integer not null
        constraint good_link_users_id_fk
            references users,
    link_id integer not null
        constraint good_link_links_id_fk
            references links
);


create table public.bad_link
(
    id      serial
        constraint bad_link_pk
            primary key,
    link_id integer not null
        constraint bad_link_links_id_fk
            references links,
    user_id integer not null
        constraint bad_link_users_id_fk
            references users
);
