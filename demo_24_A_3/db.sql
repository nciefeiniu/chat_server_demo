create database ITECH3108_30407230_a2;

\c ITECH3108_30407230_a2;


create table users
(
    username varchar(50)  not null
        constraint users_pk
            primary key,
    fullname varchar(120) not null,
    password varchar(120) not null,
    points   integer default 0
);

create table links
(
    link        varchar(128) not null
        constraint links_pk
            primary key,
    title       varchar(32)  not null,
    description varchar(128) not null,
    username    varchar(50),
    fullname    varchar(120),
    pub_time    timestamp default now(),
    score       integer   default 0
);

create table user_link_scores
(
    username varchar(50)  not null,
    link     varchar(128) not null,
    good     boolean      not null
);

create table user_hidden_links
(
    username varchar(50)  not null,
    link     varchar(128) not null
);
