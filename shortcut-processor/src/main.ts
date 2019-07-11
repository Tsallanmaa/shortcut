import axios from 'axios';
import kue from 'kue';
import cheerio from 'cheerio';
import knex from 'knex';

const config = {
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'}
  };

const q = kue.createQueue({
    prefix: 'q',
    redis: {
      host: 'redis'
    }
  });

var pg = knex({
  client: 'pg',
  connection: 'postgres://postgres@db:5432/shortcut',
  searchPath: ['public'],
});

let cardConfig: any;

axios.get('https://asunnot.oikotie.fi/user/get?format=json&rand=1135', config)
.then(({data}) => {
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
    q.process('cards', (job: any, done: any) => {
      console.log(`[JOB] Processing job ${job.data.title}...`);   
      let result: any = {
        id: job.data.id
      };  

      axios.get(job.data.url, cardConfig)
        .then(({ data }) => {
        const $ = cheerio.load(data);
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
          if (keyElement.text().trim().toLowerCase() === 'linkit')
          {
            result["links"] = [];
            valueElement.children().each((j, linkElem) => {
              const link = $(linkElem);
              if (link.is('a'))
              {
                const linkTarget = link.attr('href');
                const linkText = link.text();
                result["links"].push({title: linkText, target: linkTarget});
              }
            });
            
            return true;
          }

          const key = keyElement.text();
          const value = valueElement.text();
          result[key] = value;
        });

        pg('apartments')
          .insert({id: job.data.id, name: job.data.title, searchResult: JSON.stringify(job.data.json), json: JSON.stringify(result) })
          .then(() => {
            console.log(`Inserted data for ${job.data.title}`)
          })
          .catch((error) => {
            console.log(`Knex error: ${error}`);
         });

        done();
      });
    });
});