import { STORE_PAYMENT, PAYMENT_SUCCESS } from '../actions/action-types.js';
 
const initialState = {
  paymentData: {},
  paymentValue: 0,
  successfullTransactions: []
};

const paymentDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case STORE_PAYMENT:
      const paymentData = state.paymentData;
      let paymentValue = state.paymentValue;
      Object.keys(action.data).forEach((key) => {
        paymentData[key] = action.data[key];
        paymentValue += action.data[key][4]
      })
      return {
        paymentData: paymentData,
        paymentValue: paymentValue,
        successfullTransactions: state.successfullTransactions
      };
    case PAYMENT_SUCCESS:
      const newState = Object.assign({}, state);
      newState.successfullTransactions.push(action.data.paymentData);
      // TODO: check whether the transaction exists in the state - if it does and the incoming data is success just update the status
      return newState;
    default:
      return state;
  }
}

export default paymentDataReducer;
