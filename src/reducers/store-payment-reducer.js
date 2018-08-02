import { STORE_PAYMENT } from '../actions/action-types.js';

const initialState = {
  paymentData: {},
  paymentValue: 0
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
        paymentValue: paymentValue
      };
    default:
      return state;
  }
}

export default paymentDataReducer;
