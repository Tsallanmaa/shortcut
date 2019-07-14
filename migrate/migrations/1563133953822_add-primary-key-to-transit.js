exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createConstraint("apartment_transit", "apartment_id_pk", {
        primaryKey: "apartment_id"
    });
};

exports.down = (pgm) => {
    pgm.dropConstraint("apartments", "apartment_id_pk");
};
