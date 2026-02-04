import axios from 'axios';

const editJob = async (id, updatedJob, token) => {
  try {
    await axios.patch(`https://jobs-api-g0fe.onrender.com/api/v1/jobs/${id}`, updatedJob, {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.msg || err.message;
    return { success: false, message };
  }
};

export default editJob;
