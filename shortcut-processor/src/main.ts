import axios from 'axios';
import bull from 'bull';
import cheerio from 'cheerio';
import knex from 'knex';

const config = {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' }
};

const q = new bull('search results', 'redis://redis',
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

axios.get('https://asunnot.oikotie.fi/user/get?format=json&rand=1135', config)
  .then(({ data }) => {
    console.log('[AUTH] Authentication success!');

    cardConfig = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        'ota-cuid': data.user.cuid,
        'ota-loaded': data.user.time,
        'ota-token': data.user.token
      }
    };

    console.log(`[AUTH] CUID: ${data.user.cuid}`);
    console.log(`[AUTH] Token: ${data.user.token}`);
    console.log(`[AUTH] Time: ${data.user.time}`);
  }).then(() => {
    q.process((job: any, done: any) => {
      console.log(`[JOB] Processing job ${job.data.title}...`);
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
                pg('apartments')
                  .insert({ id: job.data.id, name: job.data.title, search_result: JSON.stringify(job.data.json), json: JSON.stringify(result) })
                  .then(() => {
                    console.log(`Inserted data for ${job.data.title}`)
                  })
                  .catch((error) => {
                    console.log(`Knex error: ${error}`);
                  });
              } else {
                pg('apartments')
                  .update({ search_result: JSON.stringify(job.data.json), json: JSON.stringify(result), last_seen_at: new Date() })
                  .where({ id: job.data.id })
                  .then(() => {
                    console.log(`Updated data for ${job.data.title}`)
                  })
                  .catch((error) => {
                    console.log(`Knex error: ${error}`);
                  });
              }
            })
            .then(() => {
              pg('apartment_price')
              .insert({ apartment_id: job.data.id, price: (job.data.json.price ? job.data.json.price.replace(/[^0-9.,]/g, "") : 0) })
              .then(() => {
                console.log(`Inserted price data for ${job.data.title} (${job.data.json.price.replace(/[^0-9.,]/g, "")})`);
              })
              .catch((error) => {
                console.log(`Knex error: ${error}`);
              });
            });

          done();
        });
    });
  });