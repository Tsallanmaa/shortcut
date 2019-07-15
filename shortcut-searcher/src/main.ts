import axios, { AxiosRequestConfig } from 'axios';
import * as cards from './model/OtCard';
import bull from 'bull';
import { Config } from './Config';

let config: Config = require('./searcher.json');

function prepareUrl(limit: number, offset: number) {
  return config.searchUrlTemplate.replace('${limit}', limit.toString()).replace('${offset}', offset.toString());
}

let cuid: string, token: string, time: string;
const authHeaders = {
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'}
  };

let queues = config.queues.map((queueName) => {
  return new bull(queueName, 'redis://redis',
    { 
      limiter: 
      {
        max: 1,
        duration: 1000 
      }
    });
});

axios.get(config.authenticationUrl, authHeaders)
.then(({data}) => {
    console.log('[AUTH] Authentication success!');

    cuid = data.user.cuid;
    token = data.user.token;
    time = data.user.time;
}).then(() => {
    const cardConfig = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
            'ota-cuid': cuid,
            'ota-loaded': time,
            'ota-token': token,
            'referer': config.referer
        }
      };

    return getCards(0, cardConfig);
}).then(() => {
  console.log("[SEARCHER] Jobs created, exiting...");
  process.exit();
});

function getCards(offset: number, requestConfig: AxiosRequestConfig): Promise<any> {
  return axios.get(prepareUrl(config.limit, offset), requestConfig)
  .then(({ data }) => {
    
    // Handle additional pages of cards
    if ((data.found - data.start) > config.limit)
    {
      return createJobsFromCards(data)
      .then(() => {
        return getCards(offset+config.limit, requestConfig);
      });
    }

    return createJobsFromCards(data);
  });
}

function createJobsFromCards(json: cards.Root): Promise<any[]> {
  let promises: Array<Promise<any>> = [];

  queues.forEach((queue) => {
    json.cards.forEach((card) => {
      promises.push(queue.add({
          title: `${card.buildingData.city} / ${card.buildingData.district} / ${card.buildingData.address}`,
          url: card.url,
          id: card.id,
          json: card
      }).then((job) => {
          console.log(`[SEARCHER] ${queue.name} job created: ${job.id} for ${card.buildingData.address}`);
      }));
    })
  });

  return Promise.all(promises);
}
