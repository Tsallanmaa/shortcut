import axios from 'axios';
import * as cards from './model/OtCard';
import bull from 'bull';

let cuid: string, token: string, time: string;
const config = {
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'}
  };

const q = new bull('search results', 'redis://redis',
  { limiter: {
    max: 10,
    duration: 5000
  }
});

axios.get('https://asunnot.oikotie.fi/user/get?format=json&rand=1135', config)
.then(({data}) => {
    console.log('[AUTH] Authentication success!');

    cuid = data.user.cuid;
    token = data.user.token;
    time = data.user.time;

    console.log(`[AUTH] CUID: ${data.user.cuid}`);
    console.log(`[AUTH] Token: ${data.user.token}`);
    console.log(`[AUTH] Time: ${data.user.time}`);
}).then(() => {
    const cardConfig = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
            'ota-cuid': cuid,
            'ota-loaded': time,
            'ota-token': token,
            'referer': 'https://asunnot.oikotie.fi/myytavat-asunnot'
        }
      };

    axios.get('https://asunnot.oikotie.fi/api/cards?buildingType%5B%5D=4&buildingType%5B%5D=8&buildingType%5B%5D=32&buildingType%5B%5D=128&buildingType%5B%5D=64&cardType=100&constructionYear%5Bmin%5D=1980&habitationType%5B%5D=1&limit=24&locations=%5B%5B14800,5,%2201640,+Vantaa%22%5D%5D&offset=0&price%5Bmax%5D=450000&price%5Bmin%5D=200000&roomCount%5B%5D=5&roomCount%5B%5D=6&roomCount%5B%5D=7&sortBy=published_sort_desc', cardConfig) // tslint:disable-line
    .then(({ data }) => {
      extractListingCards(data);
    });
});


function extractListingCards(json: cards.Root): Array<String> {
  const addresses: Array<String> = [];

  json.cards.forEach((card) => {
    q.add({
        title: `${card.buildingData.city} / ${card.buildingData.district} / ${card.buildingData.address}`,
        url: card.url,
        id: card.id,
        json: card
    }).then((job) => {
        console.log(`[JOB] Job created: ${job.id} for ${card.buildingData.address}`);
    });
  });

  return addresses;
}
