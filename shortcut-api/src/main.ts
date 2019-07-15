import knex from 'knex';
import express from 'express';
import cors from 'cors';
import { Config } from './Config';

const config: Config = require('./api.json');

var pg = knex({
    client: 'pg',
    connection: 'postgres://postgres@db:5432/shortcut',
    searchPath: ['public'],
});

const app = express();
app.use(cors());
const router = express.Router();

router.get('/apartments', async (req, res) => {
    const rows = await pg('apartments')
        .select(pg.raw("apartments.id, apartments.name, apartments.last_seen_at, apartments.json, apartments.search_result, apartment_transit.summaries as transit_summaries"))
        .leftOuterJoin('apartment_transit', {"apartments.id": "apartment_transit.apartment_id"});
    res.json(rows);
});

router.get('/apartments/:id', async (req, res) => {
    const apt = await pg('apartments').select(pg.raw("id, name, last_seen_at, json, search_result")).where({id: req.params.id}).first();
    res.json(apt);
});

router.get('/apartments/:id/prices', async (req, res) => {
    const rows = await pg('apartment_price').select('price', 'price_date').where({ apartment_id: req.params.id }).orderBy('price_date', 'asc');
    res.json(rows);
});

router.get('/apartments/:id/transit', async (req, res) => {
    const row = await pg('apartment_transit').select('summaries', 'itineraries', 'updated').where({ apartment_id: req.params.id }).first();
    res.json(row);
});


app.use('/api', router);

app.listen(config.port, () => console.log(`Shortcut API listening on ${config.port}`));