import axios from 'axios';

const deleteJob = async (id, token) => {
  try {
    await axios.delete(`https://jobs-api-g0fe.onrender.com/api/v1/jobs/${id}`, {
      headers: {
        Accept: '*/*',
        
        Authorization: token,
      },
    });

    return { success: true };
  } catch (err) {
    const message = err.response?.data?.msg || err.message;
    return { success: false, message };
  }
};

export default deleteJob;
