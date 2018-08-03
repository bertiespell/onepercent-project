import web3Reducer from './utils/web3Reducer'

import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'
import paymentDataReducer from './reducers/store-payment-reducer.js';

const reducer = combineReducers({
  routing: routerReducer,
  web3: web3Reducer,
  ...drizzleReducers,
  paymentDataReducer
})

export default reducer
