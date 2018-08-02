import { STORE_PAYMENT } from './action-types';

const storePayment = (data) => (dispatch) => {
  dispatch({
    type: STORE_PAYMENT,
    data: data
  });
}

export default storePayment;
