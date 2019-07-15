import axios from 'axios';
import bull from 'bull';
import cheerio from 'cheerio';
import knex from 'knex';
import { Auth } from './Auth';
import { Config } from './Config';

let config: Config = require('./processor.json');

const authConfig = {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' }
};

const q = new bull(config.queue, 'redis://redis',
  {
    limiter: {
      max: 10,
      duration: 5000
    }
  });

var pg = knex({
  client: 'pg',
  connection: 'postgres://postgres@db:5432/shortcut',
  searchPath: ['public'],
});

let cardConfig: any;
let authPromise: Promise<Auth> = authenticate();

function authenticate(): Promise<Auth>
{
  return axios.get(config.authenticationUrl, authConfig)
  .then(({ data }) => {
    console.log('[AUTH] Authentication success!');
    return new Auth(data.user.cuid, Number(data.user.time), data.user.token);
  });
}

q.process(async (job: any, done: any) => {

  let auth = await authPromise;
  if (new Date().getTime()/1000 - auth.time > config.authExpiryInSeconds) {
    authPromise = authenticate();
    auth = await authPromise;
  }

  cardConfig = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      'ota-cuid': auth.cuid,
      'ota-loaded': auth.time,
      'ota-token': auth.token,
      'referer': config.referer
    }
  };

  console.log(`[PROCESSOR] Processing job ${job.data.title}...`);
  let result: any = {
    id: job.data.id
  };

  axios.get(job.data.url, cardConfig)
    .then(({ data }) => {
      const $ = cheerio.load(data);

      const mainTextElements = $('.paragraph.paragraph--margin-xlarge');
      if (mainTextElements.length > 0) {
        result['description'] = $(mainTextElements[0]).text();
      }

      const rows = $('.info-table__row');
      rows.each((i, elem) => {
        const keyElement = $(elem).find($('.info-table__title'));
        const valueElement = $(elem).find($('.info-table__value'));

        // Special fields
        // Anything with analytics-impression attr set is most probably an advert
        if (keyElement.attr('analytics-impression')) {
          return true;
        }

        // Links have to be processed separately
        if (keyElement.text().trim().toLowerCase() === 'linkit') {
          result["links"] = [];
          valueElement.children().each((j, linkElem) => {
            const link = $(linkElem);
            if (link.is('a')) {
              const linkTarget = link.attr('href');
              const linkText = link.text();
              result["links"].push({ title: linkText, target: linkTarget });
            }
          });

          return true;
        }

        const key = keyElement.text();
        const value = valueElement.text();
        result[key] = value;
      });

      pg('apartments').where({ id: job.data.id }).select().first()
        .then((rows) => {
          if (!rows || rows.length === 0) {
            return pg('apartments')
              .insert({ id: job.data.id, name: job.data.title, search_result: JSON.stringify(job.data.json), json: JSON.stringify(result) })
              .then(() => {
                console.log(`[PROCESSOR] Inserted data for ${job.data.title}`)
              })
              .catch((error) => {
                console.log(`[PROCESSOR] Knex error: ${error}`);
              });
          } else {
            return pg('apartments')
              .update({ search_result: JSON.stringify(job.data.json), json: JSON.stringify(result), last_seen_at: new Date() })
              .where({ id: job.data.id })
              .then(() => {
                console.log(`[PROCESSOR] Updated data for ${job.data.title}`)
              })
              .catch((error) => {
                console.log(`[PROCESSOR] Knex error: ${error}`);
              });
          }
        })
        .then(() => {
          return pg('apartment_price')
          .insert({ apartment_id: job.data.id, price: (job.data.json.price ? job.data.json.price.replace(/[^0-9.,]/g, "") : 0) })
          .then(() => {
            console.log(`[PROCESSOR] Inserted price data for ${job.data.title} (${job.data.json.price.replace(/[^0-9.,]/g, "")})`);
          })
          .catch((error) => {
            console.log(`[PROCESSOR] Knex error: ${error}`);
          });
        });

      done();
    });
});