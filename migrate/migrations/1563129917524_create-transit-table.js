exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable("apartment_transit", {
        apartment_id: {
            type: "integer", 
            notNull: true
        },
        summaries: { 
            type: "jsonb", 
            notNull: true 
        },
        itineraries: { 
            type: "jsonb", 
            notNull: true 
        },
        updated: {
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
};

exports.down = (pgm) => {
    pgm.dropTable("apartment_transit");
};
