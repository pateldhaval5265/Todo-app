
const createJob = async (jobData, token) => {
    try {
      const response = await fetch('https://jobs-api-g0fe.onrender.com/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'Accept': '*/*',
        },
        body: JSON.stringify(jobData),
      });
      
      const data = await response.json();
  
      if (!response.ok) {
        return { success: false, message: data.msg || 'Failed to create job' };
      }
  
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };
  
  export default createJob;
  