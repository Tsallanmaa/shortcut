import axios from 'axios';
import bull from 'bull';
import knex from 'knex';
import {Coordinates} from './Coordinates';
import moment from 'moment';

const q = new bull('transit search', 'redis://redis',
  {
    limiter: {
      max: 1,
      duration: 1000
    }
  });

var pg = knex({
  client: 'pg',
  connection: 'postgres://postgres@db:5432/shortcut',
  searchPath: ['public'],
});

const workCoordsPromise = getCoordinates("Hiomotie 3, Helsinki");
const cityCoordsPromise = getCoordinates("Aleksanterinkatu 52, Helsinki");

q.process(async (job: any, done: any) => {
  const card = job.data.json;

  console.log(`[TRANSIT] Processing job ${job.data.title}...`);
  if (await resultExistsForApt(job.data.id))
  {
    console.log(`[TRANSIT] Result found for ${job.data.id}, skipping...`);
    done();
    return;
  }

  const workCoords = await workCoordsPromise;
  const cityCoords = await cityCoordsPromise;
  const aptCoords = await getCoordinates(`${card.buildingData.address}, ${card.buildingData.city}`);

  let result: any = {
    id: job.data.id,
    summaries: [],
    itineraries: []
  };

  // Route to work on next monday morning, arriving at 9:00
  const workPromise = getItineraries(aptCoords, workCoords, nextDay(1).set("hour", 9).set("minute", 0).set("second", 0))
  .then((itineraries: Array<any>) => {
    result.itineraries.push({
      tag: "WORK",
      itineraries: itineraries
    });
    prettyPrintItineraries(itineraries);
    return itineraries;
  }).then((itineraries) => {
    result.summaries.push({
      tag: "WORK",
      summary: summarizeItineraries(itineraries)
    });
    return itineraries;
  });

  // Route to city center on next saturday, arriving at 17:00
  const cityPromise = getItineraries(aptCoords, cityCoords, nextDay(6).set("hour", 17).set("minute", 0).set("second", 0))
  .then((itineraries: Array<any>) => {
    result.itineraries.push({
      tag: "CITY",
      itineraries: itineraries
    });
    prettyPrintItineraries(itineraries);
    return itineraries;
  }).then((itineraries) => {
    result.summaries.push({
      tag: "CITY",
      summary: summarizeItineraries(itineraries)
    });
    return itineraries;
  });

  await Promise.all([workPromise, cityPromise]);
  await persistResult(card.id, result);

  done();
});

function summarizeItineraries(itineraries: any[])
{
  if (!itineraries || itineraries.length === 0) { return {}; }
  const divisor = itineraries.length;

  let transitLegCount = 0;
  let duration = 0;
  let walkDistance = 0;
  let distance = 0;
  itineraries.forEach((it) => {
    transitLegCount += it.legs.filter((leg: any) => leg.transitLeg).length;
    duration += it.duration;
    walkDistance += it.walkDistance;
    distance += it.legs.map((leg: any) => leg.distance).reduce((sum: number, dist: number) => sum + dist);
  });

  return {
    averageTransitLegCount: transitLegCount / divisor,
    averageDuration: duration / divisor,
    averageWalkDistance: walkDistance / divisor,
    averageDistance: distance / divisor,
    itineraryCount: divisor
  };
}

async function getCoordinates(address: string): Promise<Coordinates>
{
  let result = await axios.get(`https://api.digitransit.fi/geocoding/v1/search?text=${encodeURI(address)}&size=1`);
  if (!result.data.features || result.data.features.length === 0)
  {
    throw new Error(`Fetching coordinates for ${address} failed`);
  }

  var feature = result.data.features[0];

  console.log(`[TRANSIT] Resolved ${address} to ${feature.properties.street} ${feature.properties.housenumber}, ${feature.properties.postalcode} ${feature.properties.locality}, ${feature.properties.country} with confidence ${feature.properties.confidence}`)

  return { name: `${feature.properties.street} ${feature.properties.housenumber}, ${feature.properties.postalcode} ${feature.properties.locality}`, latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0] };
}

async function getItineraries(from: Coordinates, to: Coordinates, arrivalTime: moment.Moment): Promise<any>
{
  const query = `{
    plan(fromPlace: "${from.name}::${from.latitude},${from.longitude}",
      toPlace: "${to.name}::${to.latitude},${to.longitude}",
      numItineraries: 3,
      date: "${arrivalTime.format("YYYY-MM-DD")}",
      time: "${arrivalTime.format("HH:mm:ss")}",
      arriveBy: true) 
    {
      itineraries {
        walkDistance
        duration
        legs {
          mode
          transitLeg
          startTime
          endTime
          from {
            lat
            lon
            name
          }
          to {
            lat
            lon
            name
          }
          distance
          route {
            shortName
          }
        }
      }
    }
  }
  `;

  return axios.post('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', 
    JSON.stringify({
      query
    }),
    {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  })
    .then(({data}) => {
      if (!data.data.plan.itineraries) {
        console.log(query);
      }
      console.log(`[TRANSIT] Received ${data.data.plan.itineraries.length} itineraries for ${from.name}`);
      return data.data.plan.itineraries;
    })
    .catch((reason) => {
        console.log(`[TRANSIT] GraphQL error: ${reason}`);
    });
}

function persistResult(id: number, result: any) {
  return resultExistsForApt(id)
  .then((exists) => {
    if (!exists) {
      return pg('apartment_transit')
        .insert({ apartment_id: id, summaries: JSON.stringify(result.summaries), itineraries: JSON.stringify(result.itineraries) })
        .then(() => {
          console.log(`[TRANSIT] Inserted transit data for ${id}`)
        })
        .catch((error) => {
          console.log(`[TRANSIT] Knex error: ${error}`);
        });
    } else {
      return pg('apartment_transit')
        .update({ summaries: JSON.stringify(result.summaries), itineraries: JSON.stringify(result.itineraries), updated: new Date() })
        .where({ apartment_id: id })
        .then(() => {
          console.log(`[TRANSIT] Updated data for ${id}`)
        })
        .catch((error) => {
          console.log(`[TRANSIT] Knex error: ${error}`);
        });
    }
  });
}

function resultExistsForApt(id: number): Promise<boolean> {
  return pg('apartment_transit').where({ apartment_id: id }).select()
    .then((rows) => {
      return rows && rows.length > 0;
    });
}

function nextDay(dayOfTheWeek: number): moment.Moment {
  const today = moment().isoWeekday();

  if (today <= dayOfTheWeek) {
    return moment().isoWeekday(dayOfTheWeek);
  } else {
    return moment().add(1, 'weeks').isoWeekday(dayOfTheWeek);
  }
}

function prettyPrintItineraries(itineraries: any[]) {
  if (!itineraries) { return; }
  itineraries.forEach((it, idx) => {
    const legs: any[] = it.legs.filter((leg: any) => leg.transitLeg);
    console.log(`Itinerary #${idx} [${it.legs[0].from.name} - ${it.legs[it.legs.length-1].to.name}]: ${(it.duration/60).toFixed(0)}m ${it.duration%60}s, with ${legs.length} transit(s) and ${(it.walkDistance/1000).toFixed(2)} km walk`);
  });
}