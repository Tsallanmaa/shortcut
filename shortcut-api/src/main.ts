import knex from 'knex';
import express from 'express';
import cors from 'cors';

const port = 3001;

var pg = knex({
    client: 'pg',
    connection: 'postgres://postgres@db:5432/shortcut',
    searchPath: ['public'],
});

const app = express();
app.use(cors());
const router = express.Router();

router.get('/apartments', (req, res) => {
    return pg('apartments').select(pg.raw("id, name, last_seen_at, json, search_result"))
        .then(function(rows) {
       console.log(`Found ${rows.length} apartments!`);
       res.json(rows);
    });
});

app.use('/api', router);

app.listen(port, () => console.log(`Shortcut API listening on ${port}`));