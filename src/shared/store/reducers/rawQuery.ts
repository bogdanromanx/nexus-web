import { RawQueryActions } from '../actions/rawQuery';
import { PaginatedList, PaginationSettings } from '@bbp/nexus-sdk';
import { ElasticSearchHit } from '@bbp/nexus-sdk/lib/View/ElasticSearchView';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk/lib/View/SparqlView';

const DEFAULT_PAGINATION_SIZE = 20;

export interface RawQueryState {
  fetching: boolean;
  response: SparqlViewQueryResponse;
}

export interface RawElasticSearchQueryState {
  fetching: boolean;
  response: PaginatedList<ElasticSearchHit>;
  paginationSettings: PaginationSettings;
  query?: string;
}

const initialState: RawQueryState = {
  fetching: false,
  response: {
    head: {
      vars: [],
    },
    results: undefined,
  },
};

const initialElasticSearchState: RawElasticSearchQueryState = {
  fetching: false,
  query: JSON.stringify({
    "query": {
      "term": {
        "_deprecated": false
      }
    }
  }, null, 2),
  response: {
    total: 0,
    results: []
  },
  paginationSettings: {
    from: 0,
    size: DEFAULT_PAGINATION_SIZE,
  },
};

export function rawElasticSearchQueryReducer(
  state: RawElasticSearchQueryState = initialElasticSearchState,
  action: RawQueryActions
) {
  switch (action.type) {
    case '@@rawQuery/QUERYING':
      return { ...state, fetching: true, query: action.query, paginationSettings: state.query === action.query ? action.paginationSettings : initialElasticSearchState.paginationSettings };
    case '@@rawQuery/QUERYING_FAILURE':
      return { ...state, fetching: false, paginationSettings: initialElasticSearchState.paginationSettings };
    case '@@rawQuery/QUERYING_SUCCESS':
      return { ...state, fetching: false, response: action.payload };
    default:
      return state;
  }
};

export default function rawQueryReducer(
  state: RawQueryState = initialState,
  action: RawQueryActions
) {
  switch (action.type) {
    case '@@rawQuery/QUERYING':
      return { ...state, fetching: true };
    case '@@rawQuery/QUERYING_FAILURE':
      return { ...state, fetching: false };
    case '@@rawQuery/QUERYING_SUCCESS':
      return { ...state, fetching: false, response: action.payload };
    default:
      return state;
  }
}