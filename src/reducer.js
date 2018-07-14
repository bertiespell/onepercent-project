import web3Reducer from './utils/web3Reducer'

import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'

const reducer = combineReducers({
  routing: routerReducer,
  web3: web3Reducer,
  ...drizzleReducers
})

export default reducer
