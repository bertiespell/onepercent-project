import { STORE_PAYMENT, PAYMENT_SUCCESS, UPDATE_PAYMENT_AS_SUCCESSFUL, SUBMIT_APPLICATION } from '../actions/action-types.js';
 
const initialState = {
  paymentData: [],
  paymentValue: 0,
  successfullTransactions: [],
  applications: [],
};

const paymentDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case STORE_PAYMENT: {
      const newState = Object.assign({}, state)
      let paymentValue = newState.paymentValue;
      Object.keys(action.data).forEach((key) => {
        paymentValue += action.data[key][4]
      })
      newState.paymentValue = paymentValue;
      return newState;
    }
    case PAYMENT_SUCCESS: {
        const newState = Object.assign({}, state);
        newState.paymentData.push(action.data.paymentData);
        return newState;
    }
    case UPDATE_PAYMENT_AS_SUCCESSFUL: {
        const newState = Object.assign({}, state);
        const newTransactions = newState.paymentData[action.data.paymentData].concat();
        newTransactions[0] = "Success";
  
        newState.paymentData[action.data.paymentData] = newTransactions;
        return newState
    }
    case SUBMIT_APPLICATION: {
      const newState = Object.assign({}, state);
      newState.applications.push(action.data);
      return newState
    }
    default:
      return state;
  }
}

export default paymentDataReducer;
