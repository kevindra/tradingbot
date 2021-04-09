import request from 'request';
import queryString from 'query-string';
import moment from 'moment-timezone';
import {CACHE} from '../app';
import {getQuote} from './yahoo-finance-client';
export interface GetData {
  symbol: string;
  apikey: string;
  function: string;
  outputsize: string;
}

const URL = 'https://www.alphavantage.co/query?';

export interface AVGetDataResult {
  [key: string]: AVDailyTimeSeries;
}
export interface AVDailyTimeSeries {
  [key: string]: AVDailyPriceData;
}
export interface AVDailyPriceData {
  [key: string]: string;
}

export interface GlobalQuote {
  [key: string]: Quote;
}
export interface Quote {
  [key: string]: string;
}

export class AlphaVantageClient {
  constructor() {}

  // async getQuote(symbol: string): Promise<GlobalQuote> {
  //   const getDataQuery: GetData = {
  //     symbol: symbol,
  //     apikey: process.env.AV_API_KEY || '',
  //     function: 'GLOBAL_QUOTE',
  //     outputsize: 'full',
  //   };
  //   const url = URL + queryString.stringify(getDataQuery);
  //   console.log(`URL: ${url}`);
  //   const opt = {
  //     url: url,
  //   };

  //   return new Promise((resolve, reject) => {
  //     request(opt, (err, res, body) => {
  //       if (err) {
  //         reject(JSON.parse(body));
  //       } else {
  //         resolve(JSON.parse(body));
  //       }
  //     });
  //   });
  // }

  async getData(symbol: string): Promise<AVGetDataResult> {
    const getDataQuery: GetData = {
      symbol: symbol,
      apikey: process.env.AV_API_KEY || '',
      function: 'TIME_SERIES_DAILY_ADJUSTED',
      outputsize: 'full',
    };
    const url = URL + queryString.stringify(getDataQuery);

    console.log(`URL: ${url}`);
    const opt = {
      url: url,
    };

    const cacheKey = `${symbol}-${getDataQuery.function}-${getDataQuery.outputsize}`;
    const cacheEntry = CACHE.get(cacheKey);

    let data: AVGetDataResult;
    if (cacheEntry !== undefined) {
      data = cacheEntry as AVGetDataResult;
      console.log(`Cache hit for ${cacheKey}`);
    } else {
      console.log(`Cache miss for ${cacheKey}`);
      data = await new Promise((resolve, reject) => {
        request(opt, (err, res, body) => {
          if (err) {
            reject(JSON.parse(body));
          } else {
            let response = JSON.parse(body);
            CACHE.set(cacheKey, response);
            console.log(`Updated the cache for ${cacheKey}`);
            resolve(response);
          }
        });
      });
    }

    var today = moment(new Date()).tz('America/Toronto');

    // if today is not weekend or market close hours,
    // get the latest price as well to get real time confidence values
    if (
      !(today.day() == 6 || today.day() == 7) &&
      today.hour() >= 9 &&
      today.hour() < 16
    ) {
      const quote = await getQuote(symbol);
      let todayStr = today.format('YYYY-MM-DD');
      data['Time Series (Daily)'][todayStr] = {
        '1. open': `${quote.price.regularMarketOpen}`,
        '2. high': `${quote.price.regularMarketDayHigh}`,
        '3. low': `${quote.price.regularMarketDayLow}`,
        '4. close': `${quote.price.regularMarketPrice}`, // not yet closed, so current price = close
        '5. adjusted close': `${quote.price.regularMarketPrice}`, // not yet closed, so current price = close
        '6. volume': `${quote.price.regularMarketVolume}`,
        '7. dividend amount': '0.0000',
        '8. split coefficient': '1.0',
      };
    }
    return data;
  }
}

// https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&outputsize=full&apikey=demo
// module.exports = new AlphaVantageClient();
// let av = new AlphaVantageClient();
// // av.getData('AAPL').then(console.log)
// av.getData('AAPL').then(console.log);
