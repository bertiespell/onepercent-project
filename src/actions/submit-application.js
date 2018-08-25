import { SUBMIT_APPLICATION } from './action-types';

const submitApplication = (data, name, description) => (dispatch) => {
  dispatch({
    type: SUBMIT_APPLICATION,
    data: data,
    name: name,
    description: description,
  });
}

export default submitApplication;
