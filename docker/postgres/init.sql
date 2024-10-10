-- users
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE
    "public"."users" (
        "id" integer DEFAULT nextval ('users_id_seq') NOT NULL,
        "login" character varying(128) NOT NULL,
        "name" character varying(128) NOT NULL,
        "balance" integer NOT NULL DEFAULT 0,
        CONSTRAINT "users_login" UNIQUE ("login"),
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
    )
WITH
    (oids = false);

INSERT INTO
    "users" ("login", "name", balance)
VALUES
    ('e.bob', 'Bob Example', 120 * 100),
    ('e.alice', 'Alice Example', 9 * 100);

-- items
CREATE SEQUENCE items_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE
    "public"."items" (
        "id" integer DEFAULT nextval ('items_id_seq') NOT NULL,
        "market_hash_name" character varying NOT NULL,
        "item_page" character varying NOT NULL,
        "market_page" character varying NOT NULL,
        CONSTRAINT "items_market_hash_name" UNIQUE ("market_hash_name"),
        CONSTRAINT "items_pkey" PRIMARY KEY ("id")
    )
WITH
    (oids = false);

-- purchases
CREATE SEQUENCE purchases_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE
    "public"."purchases" (
        "id" integer DEFAULT nextval ('purchases_id_seq') NOT NULL,
        "user_id" integer NOT NULL,
        "item_id" integer NOT NULL,
        "price" integer NOT NULL,
        "currency" character(3) NOT NULL,
        CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
    )
WITH
    (oids = false);

ALTER TABLE ONLY "public"."purchases" ADD CONSTRAINT "purchases_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items (id) ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE;

ALTER TABLE ONLY "public"."purchases" ADD CONSTRAINT "purchases_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE;