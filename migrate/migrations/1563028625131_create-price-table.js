exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createConstraint("apartments", "id_pk", {
        primaryKey: "id"
    });

    pgm.createTable("apartment_price", {
        apartment_id: {
            type: "integer", 
            notNull: true
        },
        price: { 
            type: "numeric", 
            notNull: true 
        },
        price_date: {
            type: "date",
            notNull: true,
            default: pgm.func("CURRENT_DATE")
        }
      },
      { constraints: {
          foreignKeys: {
              columns: "apartment_id",
              references: "apartments(id)",
              onDelete: "CASCADE",
              onUpdate: "CASCADE"
          }
      }});

      pgm.sql("INSERT INTO apartment_price(apartment_id, price_date, price) SELECT id, created_at, regexp_replace(search_result->>'price', '[^0-9,\.]+', '', 'g')::numeric FROM apartments");
};

exports.down = (pgm) => {
    pgm.dropConstraint("apartments", "id_pk");
    pgm.dropTable("apartment_price");
};
