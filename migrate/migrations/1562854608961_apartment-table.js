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
        createdAt: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        },
        lastSeenAt: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        },
        searchResult: {
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
