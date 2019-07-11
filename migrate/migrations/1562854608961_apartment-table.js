exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable("apartments", {
        id: {
            type: "integer", 
            notNull: true
        },
        name: { 
            type: "varchar(1000)", 
            notNull: true 
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        },
        last_seen_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        },
        search_result: {
            type: "jsonb"
        },
        json: {
            type: "jsonb"
        }
      });
};

exports.down = (pgm) => {
    pgm.dropTable("apartments");
};
