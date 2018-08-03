import { UPDATE_PAYMENT_AS_SUCCESSFUL } from './action-types';

const updatePaymentAsSuccessfull = (data) => (dispatch) => {
  dispatch({
    type: UPDATE_PAYMENT_AS_SUCCESSFUL,
    data: data
  });
}

export default updatePaymentAsSuccessfull;
