import {Opportunity} from './OpportunitiesFinder';

export interface IndicatorThreshold {
  minIndicatorValue: number;
  maxIndicatorValue: number;
}

export const filterOpportunities = (
  opportunities: Opportunity[],
  indicatorIndex: number,
  indicatorThreshold: IndicatorThreshold
): Opportunity[] => {
  const filteredOpportunities: Opportunity[] = opportunities
    .filter(
      o =>
        o.indicatorValues.length > indicatorIndex &&
        o.indicatorValues[indicatorIndex] >=
          indicatorThreshold.minIndicatorValue
    )
    .filter(
      o =>
        o.indicatorValues.length > indicatorIndex &&
        o.indicatorValues[indicatorIndex] <=
          indicatorThreshold.maxIndicatorValue
    )
    .sort((a, b) =>
      a.indicatorValues.length > indicatorIndex &&
      b.indicatorValues.length > indicatorIndex &&
      a.indicatorValues[indicatorIndex] < b.indicatorValues[indicatorIndex]
        ? 1
        : a.indicatorValues[indicatorIndex] > b.indicatorValues[indicatorIndex]
        ? -1
        : 0
    );
  console.log(
    `Filtered opportunities ${JSON.stringify(
      filteredOpportunities.length,
      null,
      2
    )}`
  );
  return filteredOpportunities;
};
