import express from 'express';
import {ConfidenceCalculator} from '../ConfidenceCalculator';
import {withTryCatchNext} from '../util';

const latestConfApiRouter = express.Router();
const confidenceCalculator = new ConfidenceCalculator();

latestConfApiRouter.get('/', async (req, res, next) => {
  await withTryCatchNext(req, res, next, async (req, res, next) => {
    const ticker = req.query.t as string;
    const currency = req.query.c as string;
    const type = req.query.type as string;
    const horizon = parseInt((req.query.horizon as string) || '365');

    if (type === 'stocks') {
      const data = await confidenceCalculator.stockBuyerConf(ticker, horizon);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data[data.length - 2]));
    } else if (type === 'crypto') {
      const data = await confidenceCalculator.cryptoBuyerConf(
        ticker,
        currency,
        horizon
      );
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data[data.length - 2]));
    } else {
      res.end('Not found');
    }
  });
});

export {latestConfApiRouter};
