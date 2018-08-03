import { PAYMENT_SUCCESS } from './action-types';

const paymentSuccess = (data) => (dispatch) => {
  dispatch({
    type: PAYMENT_SUCCESS,
    data: data
  });
}

export default paymentSuccess;
